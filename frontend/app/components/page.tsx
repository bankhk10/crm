import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ComponentsPage() {
  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">Button</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Input</h2>
        <Input placeholder="Type here" />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Card</h2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This is an example card using shadcn/ui components.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

