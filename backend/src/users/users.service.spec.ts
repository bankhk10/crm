import { BadRequestException } from "@nestjs/common";
import { UsersService } from "./users.service";

type MockFn<T extends (...args: any[]) => any> = jest.Mock<
  ReturnType<T>,
  Parameters<T>
>;

type PrismaMock = {
  user: {
    findUnique: MockFn<any>;
  };
  role: {
    findMany: MockFn<any>;
    findUnique: MockFn<any>;
  };
  userRole: {
    createMany: MockFn<any>;
    deleteMany: MockFn<any>;
    count: MockFn<any>;
    findUnique: MockFn<any>;
  };
};

const createPrismaMock = (): PrismaMock => ({
  user: {
    findUnique: jest.fn(),
  },
  role: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  userRole: {
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
  },
});

describe("UsersService RBAC role assignment", () => {
  it("assignRoles deduplicates role ids and assigns them", async () => {
    const prisma = createPrismaMock();
    const service = new UsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValue({ id: 1, userRoles: [] });
    prisma.role.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    prisma.userRole.createMany.mockResolvedValue({ count: 2 });

    await service.assignRoles(1, [1, 1, 2]);

    expect(prisma.role.findMany).toHaveBeenCalledWith({
      where: { id: { in: [1, 2] } },
      select: { id: true },
    });
    expect(prisma.userRole.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 1, roleId: 1 },
        { userId: 1, roleId: 2 },
      ],
      skipDuplicates: true,
    });
  });

  it("unassignRoles prevents removing the final admin role", async () => {
    const prisma = createPrismaMock();
    const service = new UsersService(prisma as any);

    prisma.user.findUnique.mockResolvedValue({ id: 1, userRoles: [] });
    prisma.role.findUnique.mockResolvedValue({ id: 10, name: "ADMIN" });
    prisma.userRole.count.mockResolvedValue(1);
    prisma.userRole.findUnique.mockResolvedValue({ userId: 1, roleId: 10 });

    await service.unassignRoles(1, [10]).catch((error) => {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe("Cannot remove the last admin role.");
    });
    expect(prisma.userRole.deleteMany).not.toHaveBeenCalled();
  });

  it("unassignRoles removes roles when more than one admin exists", async () => {
    const prisma = createPrismaMock();
    const service = new UsersService(prisma as any);

    prisma.user.findUnique
      .mockResolvedValueOnce({ id: 1, userRoles: [] })
      .mockResolvedValueOnce({ id: 1, userRoles: [] });
    prisma.role.findUnique.mockResolvedValue({ id: 10, name: "ADMIN" });
    prisma.userRole.count.mockResolvedValue(2);
    prisma.userRole.findUnique.mockResolvedValue({ userId: 1, roleId: 10 });
    prisma.userRole.deleteMany.mockResolvedValue({ count: 1 });

    await service.unassignRoles(1, [10, 20]);

    expect(prisma.userRole.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 1,
        roleId: { in: [10, 20] },
      },
    });
  });
});
