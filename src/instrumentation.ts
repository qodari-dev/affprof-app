export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCrons } = await import("./server/crons");
    startCrons();
  }
}
