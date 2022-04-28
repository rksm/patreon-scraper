export interface Args {
  campaignId: string;
  dataDir: string;
  patreonUrl: string;
  debug?: boolean;
}

export function parseArgs(args: string[]): Args {
  let result: Partial<Args> = {};
  for (let i = 0; i < args.length; i += 2) {
    const name = args[i];
    const val = args[i + 1];
    switch (name) {
      case "--campaign_id":
        result.campaignId = val;
        break;
      case "--data_dir":
        result.dataDir = val;
        break;
      case "--patreon_url":
        result.patreonUrl = val;
        break;
      case "--debug":
        result.debug = true;
        break;
      default:
    }
  }

  if (!result.campaignId) throw new Error("--campaign_id missing");
  if (!result.dataDir) throw new Error("--data_dir missing");
  if (!result.patreonUrl) throw new Error("--patreon_url missing");
  return result as Args;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function pad(s: String, length: number, padString: String): String {
  if (s.length >= length) return s;
  if (padString.length === 0) {
    throw new Error("padString is empty!");
  }
  while (s.length < length) {
    s = `${padString}${s}`;
  }
  return s;
}

export function formatDate() {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = pad(String(date.getMonth() + 1), 2, "0");
  const day = String(date.getDate());
  return `${year}-${month}-${day}`;
}

export function formatDateAndTime() {
  const dateString = formatDate();
  const date = new Date();
  const hours = pad(String(date.getHours()), 2, "0");
  const mins = pad(String(date.getMinutes()), 2, "0");
  const secs = pad(String(date.getSeconds()), 2, "0");
  return `${dateString}_${hours}_${mins}_${secs}`;
}
