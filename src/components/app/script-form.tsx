'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Clapperboard } from 'lucide-react';

const FormSchema = z.object({
  script: z.string().min(10, {
    message: 'Script must be at least 10 characters.',
  }),
});

type ScriptFormProps = {
  onSubmit: (script: string) => void;
  isLoading: boolean;
};

export function ScriptForm({ onSubmit, isLoading }: ScriptFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      script: '',
    },
  });

  function onFormSubmit(data: z.infer<typeof FormSchema>) {
    onSubmit(data.script);
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Clapperboard className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl">ScriptVision AI</CardTitle>
          <CardDescription>
            Paste your script below to automatically generate storyboard sketches.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="script"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Script</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="INT. COFFEE SHOP - DAY..."
                        className="min-h-[250px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Storyboard'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
