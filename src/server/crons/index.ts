import { env } from "@/env";
import { runScheduledLinkChecks } from "@/server/services/link-checker";
import { runTrialReminders } from "@/server/services/trial-reminders";
import { runScheduledWeeklyDigests } from "@/server/services/weekly-digest";
import { CronJob } from "cron";

declare global {
  var __cronsStarted: boolean | undefined;
}

function isPausedScheduler() {
  return env.PAUSE_SCHEDULER === "1" || env.PAUSE_SCHEDULER === "true";
}

async function runLinkCheckerCron() {
  try {
    const result = await runScheduledLinkChecks();
    console.log(
      `[cron][link-checker] checked=${result.checkedCount} broken=${result.brokenCount} batchSize=${result.batchSize}`,
    );
  } catch (error) {
    console.error("[cron][link-checker]", error);
  }
}

async function runWeeklyDigestCron() {
  try {
    const result = await runScheduledWeeklyDigests();
    console.log(
      `[cron][weekly-digest] eligible=${result.eligibleUsers} sent=${result.sentCount} skipped=${result.skippedCount} failed=${result.failedCount}`,
    );
  } catch (error) {
    console.error("[cron][weekly-digest]", error);
  }
}

async function runTrialReminderCron() {
  try {
    const result = await runTrialReminders();
    console.log(
      `[cron][trial-reminder] eligible=${result.eligibleUsers} sent=${result.sentCount} skipped=${result.skippedCount} failed=${result.failedCount}`,
    );
  } catch (error) {
    console.error("[cron][trial-reminder]", error);
  }
}

export function startCrons() {
  if (globalThis.__cronsStarted) return;
  globalThis.__cronsStarted = true;

  if (isPausedScheduler()) return;

  const jobs = [
    {
      cron: env.LINK_CHECKER_CRON,
      fn: () => {
        void runLinkCheckerCron();
      },
    },
    {
      cron: env.WEEKLY_DIGEST_CRON,
      fn: () => {
        void runWeeklyDigestCron();
      },
    },
    {
      cron: env.TRIAL_REMINDER_CRON,
      fn: () => {
        void runTrialReminderCron();
      },
    },
  ];

  for (const { cron, fn } of jobs) {
    new CronJob(cron, fn, null, true, env.SCHEDULER_TIMEZONE);
  }
}
