'use client';

import * as React from 'react';
import { AlertCircle, Download, FileUp, Loader2 } from 'lucide-react';

import { buildCsv, parseCsv } from '@/utils/csv';
import type { ImportPreviewError } from '@/utils/bulk-import';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface CsvImportColumn {
  name: string;
  required: boolean;
  description: string;
  example: string;
}

export interface CsvImportResult {
  importedCount: number;
  skippedCount: number;
  errors: Array<{ row: number; message: string }>;
  extraSummary?: string;
}

export function CsvImportDialog<TRow extends { row: number }>({
  title,
  description,
  opened,
  onOpened,
  columns,
  templateHeaders,
  templateRows,
  previewColumns,
  normalizeRows,
  onImport,
  importing,
  importLabel,
  templateFileName,
}: {
  title: string;
  description: string;
  opened: boolean;
  onOpened: (opened: boolean) => void;
  columns: CsvImportColumn[];
  templateHeaders: string[];
  templateRows: string[][];
  previewColumns: Array<{ key: keyof TRow; label: string }>;
  normalizeRows: (rawRows: Array<Record<string, string>>) => { rows: TRow[]; errors: ImportPreviewError[] };
  onImport: (rows: TRow[]) => Promise<CsvImportResult>;
  importing: boolean;
  importLabel: string;
  templateFileName: string;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState('');
  const [rows, setRows] = React.useState<TRow[]>([]);
  const [errors, setErrors] = React.useState<ImportPreviewError[]>([]);
  const [result, setResult] = React.useState<CsvImportResult | null>(null);

  React.useEffect(() => {
    if (!opened) {
      setFileName('');
      setRows([]);
      setErrors([]);
      setResult(null);
    }
  }, [opened]);

  const handleDownloadTemplate = React.useCallback(() => {
    const csv = buildCsv(templateHeaders, templateRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = templateFileName;
    link.click();
    URL.revokeObjectURL(url);
  }, [templateFileName, templateHeaders, templateRows]);

  const handleFileChange = React.useCallback(async (file: File) => {
    const text = await file.text();
    const parsed = parseCsv(text);
    const normalized = normalizeRows(parsed.rows);

    setFileName(file.name);
    setRows(normalized.rows);
    setErrors(normalized.errors);
    setResult(null);
  }, [normalizeRows]);

  const handleImport = React.useCallback(async () => {
    if (rows.length === 0) return;

    const nextResult = await onImport(rows);
    setResult(nextResult);

    if (nextResult.errors.length === 0) {
      onOpened(false);
    }
  }, [onImport, onOpened, rows]);

  return (
    <Dialog open={opened} onOpenChange={onOpened}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 pt-2">
            <div className="rounded-xl border border-dashed bg-muted/15 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-medium">CSV file</div>
                  <div className="text-sm text-muted-foreground">
                    Use the template to match the expected columns. Excel is not supported in v1.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                    <Download />
                    Download template
                  </Button>
                  <Button type="button" onClick={() => fileInputRef.current?.click()}>
                    <FileUp />
                    Choose CSV
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    void handleFileChange(file);
                  }
                }}
              />
            </div>

            {fileName ? (
              <div className="rounded-xl border bg-muted/10 p-4">
                <div className="font-medium">{fileName}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {rows.length} valid row{rows.length === 1 ? '' : 's'} ready to import
                  {errors.length > 0 ? `, ${errors.length} row${errors.length === 1 ? '' : 's'} with issues` : ''}
                </div>
              </div>
            ) : null}

            {rows.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-medium">Preview</div>
                <div className="overflow-hidden rounded-xl border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-left">
                      <tr>
                        {previewColumns.map((column) => (
                          <th key={String(column.key)} className="px-3 py-2 font-medium">
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 5).map((row) => (
                        <tr key={row.row} className="border-t">
                          {previewColumns.map((column) => (
                            <td key={String(column.key)} className="px-3 py-2 align-top text-muted-foreground">
                              {String(row[column.key] ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {errors.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 font-medium text-amber-900 dark:text-amber-100">
                  <AlertCircle className="size-4" />
                  Rows with issues
                </div>
                <div className="space-y-1 text-sm text-amber-900/90 dark:text-amber-100/90">
                  {errors.slice(0, 8).map((error) => (
                    <div key={`${error.row}-${error.message}`}>
                      Row {error.row}: {error.message}
                    </div>
                  ))}
                  {errors.length > 8 ? <div>+ {errors.length - 8} more</div> : null}
                </div>
              </div>
            ) : null}

            {result ? (
              <div className="space-y-2 rounded-xl border bg-muted/10 p-4">
                <div className="font-medium">Import summary</div>
                <div className="text-sm text-muted-foreground">
                  Imported {result.importedCount}, skipped {result.skippedCount}.
                  {result.extraSummary ? ` ${result.extraSummary}` : ''}
                </div>
                {result.errors.length > 0 ? (
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {result.errors.slice(0, 8).map((error) => (
                      <div key={`${error.row}-${error.message}`}>
                        Row {error.row}: {error.message}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="fields" className="pt-2">
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Column</th>
                    <th className="px-3 py-2 font-medium">Required</th>
                    <th className="px-3 py-2 font-medium">Description</th>
                    <th className="px-3 py-2 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((column) => (
                    <tr key={column.name} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{column.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{column.required ? 'Yes' : 'Optional'}</td>
                      <td className="px-3 py-2 text-muted-foreground">{column.description}</td>
                      <td className="px-3 py-2 text-muted-foreground">{column.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="example" className="pt-2">
            <div className="rounded-xl border bg-muted/15 p-4">
              <pre className="overflow-x-auto text-xs text-muted-foreground">
                {buildCsv(templateHeaders, templateRows)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpened(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleImport()} disabled={importing || rows.length === 0}>
            {importing ? <Loader2 className="animate-spin" /> : <FileUp />}
            {importLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
