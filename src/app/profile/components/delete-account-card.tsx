'use client';

import * as React from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteAccount } from '@/hooks/queries/use-auth-queries';

export function DeleteAccountCard() {
  const t = useTranslations('profile.deleteAccount');
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirmValue, setConfirmValue] = React.useState('');
  const [confirmError, setConfirmError] = React.useState(false);

  const { mutateAsync: deleteAccount, isPending } = useDeleteAccount();

  const handleOpen = () => {
    setConfirmValue('');
    setConfirmError(false);
    setOpen(true);
  };

  const handleConfirm = async () => {
    if (confirmValue !== t('confirmWord')) {
      setConfirmError(true);
      return;
    }

    try {
      const result = await deleteAccount({});
      if (result.status === 200) {
        setOpen(false);
        router.push(result.body.logoutUrl);
      }
    } catch {
      toast.error(t('errorToast'));
    }
  };

  return (
    <>
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="size-4 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">{t('title')}</CardTitle>
              <CardDescription className="mt-0.5">{t('description')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="mb-2 text-sm font-medium text-destructive/80">{t('warningTitle')}</p>
          <ul className="space-y-1">
            {(['warning1', 'warning2', 'warning3', 'warning4'] as const).map((key) => (
              <li key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="size-1.5 shrink-0 rounded-full bg-destructive/50" />
                {t(key)}
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t border-destructive/20 pt-4">
          <Button variant="destructive" onClick={handleOpen}>
            <Trash2 />
            {t('button')}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('dialogTitle')}</DialogTitle>
            <DialogDescription>{t('dialogDescription')}</DialogDescription>
          </DialogHeader>

          <Field data-invalid={confirmError || undefined}>
            <FieldLabel>{t('confirmLabel')}</FieldLabel>
            <Input
              placeholder={t('confirmPlaceholder')}
              value={confirmValue}
              onChange={(e) => {
                setConfirmValue(e.target.value);
                setConfirmError(false);
              }}
              autoComplete="off"
            />
            {confirmError && (
              <FieldError errors={[{ message: t('confirmError') }]} />
            )}
          </Field>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              {isPending ? t('deleting') : t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
