'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import React from 'react';

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
import { Input } from '@/components/ui/input';
import { Loader2, Clapperboard, FileUp, FileCheck } from 'lucide-react';

const FormSchema = z.object({
  file: z
    .any()
    .refine((val) => val instanceof FileList && val.length > 0, {
      message: 'Необходимо загрузить файл.',
    })
    .refine((val) => val?.[0]?.size > 0, {
      message: 'Файл не может быть пустым.',
    }),
});

type ScriptFormProps = {
  onSubmit: (file: File) => void;
  isLoading: boolean;
};

export function ScriptForm({ onSubmit, isLoading }: ScriptFormProps) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const fileRef = form.register('file');
  const [fileName, setFileName] = React.useState<string | null>(null);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // We pass the FileList to the form
      form.setValue('file', event.target.files, { shouldValidate: true });
    } else {
      setFileName(null);
      form.setValue('file', null, { shouldValidate: true });
    }
  };

  function onFormSubmit(data: z.infer<typeof FormSchema>) {
    // We extract the File from the FileList before submitting
    const file = data.file[0];
    onSubmit(file);
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
            Upload your script file (.doc, .docx, .pdf) to automatically generate storyboard sketches.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="file"
                render={() => (
                  <FormItem>
                    <FormLabel className="sr-only">Script File</FormLabel>
                    <FormControl>
                      <div className="relative flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-background p-12 text-center transition-colors hover:border-primary">
                        <Input
                          type="file"
                          accept=".doc,.docx,.pdf,.txt"
                          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                          {...fileRef}
                          onChange={onFileChange}
                        />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          {fileName ? (
                            <>
                              <FileCheck className="h-10 w-10 text-green-500" />
                              <span className="font-semibold text-foreground">{fileName}</span>
                            </>
                          ) : (
                            <>
                              <FileUp className="h-10 w-10" />
                              <span className="font-semibold text-foreground">Click to upload or drag & drop</span>
                              <span>DOC, DOCX, or PDF</span>
                            </>
                          )}
                        </div>
                      </div>
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
