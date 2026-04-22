'use client';

import * as React from 'react';
import { AlertCircle, Check, Copy, Download, FileSpreadsheet, FileUp, Loader2, UploadCloud } from 'lucide-react';

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
import { cn } from '@/lib/utils';

function ErrorTable({
  errors,
  onDownload,
}: {
  errors: ImportPreviewError[];
  onDownload?: () => void;
}) {
  if (errors.length === 0) return null;
  const visible = errors.slice(0, 15);

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/20">
      <div className="flex items-center justify-between border-b border-amber-200 px-4 py-2.5 dark:border-amber-900">
        <div className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100">
          <AlertCircle className="size-4" />
          {errors.length} {errors.length === 1 ? 'issue' : 'issues'} found — fix and re-upload
        </div>
        {onDownload && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 border-amber-300 text-xs text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/40"
            onClick={onDownload}
          >
            <Download className="size-3" />
            Download failed rows
          </Button>
        )}
      </div>
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-amber-100/60 text-left dark:bg-amber-900/30">
            <tr>
              <th className="w-16 px-4 py-2 text-xs font-medium text-amber-800 dark:text-amber-200">Row</th>
              <th className="px-4 py-2 text-xs font-medium text-amber-800 dark:text-amber-200">Issue</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((error, i) => (
              <tr key={`${error.row}-${error.message}`} className={cn('border-t border-amber-200 dark:border-amber-900', i % 2 === 0 ? '' : 'bg-amber-50/40 dark:bg-amber-950/10')}>
                <td className="px-4 py-2 font-mono text-xs font-medium text-amber-700 dark:text-amber-300">{error.row}</td>
                <td className="px-4 py-2 text-amber-900/90 dark:text-amber-100/90">{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {errors.length > 15 && (
          <div className="border-t border-amber-200 px-4 py-2 text-xs text-amber-700 dark:border-amber-900 dark:text-amber-300">
            + {errors.length - 15} more issues — download the failed rows to see all
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value, dim }: { label: string; value: number; dim?: boolean }) {
  if (value === 0) return null;
  return (
    <div className={cn('flex items-center justify-between text-sm', dim ? 'text-muted-foreground' : '')}>
      <span>{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function ImportSummary({
  result,
  onDownloadFailed,
}: {
  result: CsvImportResult;
  onDownloadFailed?: () => void;
}) {
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-3 rounded-xl border bg-muted/10 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Import complete</p>
        {onDownloadFailed && (
          <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={onDownloadFailed}>
            <Download className="size-3" />
            Download failed rows
          </Button>
        )}
      </div>
      <div className="space-y-1.5 rounded-lg border bg-background px-3 py-2.5">
        <SummaryRow label="✓ Links created" value={result.createdCount} />
        <SummaryRow label="↻ Links updated" value={result.updatedCount} />
        <SummaryRow label="+ Products created automatically" value={result.createdProductsCount} dim />
        <SummaryRow label="+ Tags created automatically" value={result.createdTagsCount} dim />
        {hasErrors && (
          <div className="flex items-center justify-between text-sm text-destructive">
            <span>✕ Rows with errors</span>
            <span className="font-medium tabular-nums">{result.errors.length}</span>
          </div>
        )}
      </div>
      {hasErrors && (
        <ErrorTable errors={result.errors} onDownload={onDownloadFailed} />
      )}
    </div>
  );
}

export interface CsvImportColumn {
  name: string;
  required: boolean;
  description: string;
  example: string;
}

export interface CsvImportResult {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  createdProductsCount: number;
  createdTagsCount: number;
  errors: Array<{ row: number; message: string }>;
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
  const [rawRows, setRawRows] = React.useState<Array<Record<string, string>>>([]);
  const [rows, setRows] = React.useState<TRow[]>([]);
  const [errors, setErrors] = React.useState<ImportPreviewError[]>([]);
  const [result, setResult] = React.useState<CsvImportResult | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!opened) {
      setFileName('');
      setRawRows([]);
      setRows([]);
      setErrors([]);
      setResult(null);
      setIsDragging(false);
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
    setRawRows(parsed.rows);
    setRows(normalized.rows);
    setErrors(normalized.errors);
    setResult(null);
  }, [normalizeRows]);

  const handleDownloadFailedRows = React.useCallback((
    allErrors: Array<{ row: number; message: string }>,
  ) => {
    // Collect unique failed row numbers
    const failedRowNumbers = new Set(allErrors.map((e) => e.row));

    // Build CSV from original raw rows (row number = index + 2)
    const headers = rawRows.length > 0 ? Object.keys(rawRows[0]) : templateHeaders;
    const failedRawRows = Array.from(failedRowNumbers)
      .sort((a, b) => a - b)
      .map((rowNum) => rawRows[rowNum - 2])
      .filter(Boolean)
      .map((raw) => headers.map((h) => raw[h] ?? ''));

    const csv = buildCsv(headers, failedRawRows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `failed-rows-${templateFileName}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [rawRows, templateHeaders, templateFileName]);

  const handleImport = React.useCallback(async () => {
    if (rows.length === 0) return;
    const nextResult = await onImport(rows);
    setResult(nextResult);
    // Never auto-close — always show the summary so the user sees what happened
  }, [onImport, rows]);

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleCopyExample = React.useCallback(() => {
    void navigator.clipboard.writeText(buildCsv(templateHeaders, templateRows)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [templateHeaders, templateRows]);

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      void handleFileChange(file);
    }
  }, [handleFileChange]);

  return (
    <Dialog open={opened} onOpenChange={onOpened}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="flex min-h-0 flex-1 flex-col">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="fields">Fields & example</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="min-h-0 flex-1 overflow-y-auto space-y-4 pt-2">

            {/* Drop zone */}
            <div
              className={cn(
                'relative cursor-pointer rounded-xl border-2 border-dashed transition-colors',
                isDragging
                  ? 'border-primary bg-primary/5'
                  : fileName
                    ? 'border-border bg-muted/10'
                    : 'border-border bg-muted/10 hover:border-primary/50 hover:bg-muted/20',
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFileChange(file);
                  // reset so the same file can be re-selected
                  event.target.value = '';
                }}
              />

              {fileName ? (
                // ── File loaded state ──────────────────────────────────────
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {rows.length} valid row{rows.length === 1 ? '' : 's'} ready to import
                      {errors.length > 0 ? ` · ${errors.length} row${errors.length === 1 ? '' : 's'} with issues` : ''}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="shrink-0">
                    <FileUp className="size-3.5" />
                    Replace
                  </Button>
                </div>
              ) : (
                // ── Empty / drag state ────────────────────────────────────
                <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
                    isDragging ? 'bg-primary/15' : 'bg-muted/40',
                  )}>
                    <UploadCloud className={cn('h-6 w-6 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragging ? 'Drop your CSV file here' : 'Drag & drop your CSV here'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">or click to browse</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download template */}
            <div className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Need a template?</p>
                <p className="text-xs text-muted-foreground">Download it, fill it in, then upload.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download />
                Download template
              </Button>
            </div>

            {/* Preview table */}
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
                            <td key={String(column.key)} className="max-w-[200px] truncate px-3 py-2 align-top text-muted-foreground">
                              {String(row[column.key] ?? '—')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {rows.length > 5 && (
                  <p className="text-xs text-muted-foreground">Showing 5 of {rows.length} rows.</p>
                )}
              </div>
            ) : null}

            {/* Row errors (pre-import validation — no download button yet) */}
            <ErrorTable errors={errors} />

            {/* Import result */}
            {result ? (
              <ImportSummary
                result={result}
                onDownloadFailed={
                  result.errors.length > 0
                    ? () => handleDownloadFailedRows(result.errors)
                    : undefined
                }
              />
            ) : null}
          </TabsContent>

          <TabsContent value="fields" className="min-h-0 flex-1 overflow-y-auto space-y-4 pt-2">
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

            <div className="rounded-xl border bg-muted/10">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Example CSV</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={handleCopyExample}
                >
                  {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="overflow-x-auto p-4">
                <pre className="text-xs text-muted-foreground">
                  {buildCsv(templateHeaders, templateRows)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpened(false)}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button onClick={() => void handleImport()} disabled={importing || rows.length === 0}>
              {importing ? <Loader2 className="animate-spin" /> : <FileUp />}
              {importLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
