import { PathLike } from "fs";

const args = process.argv.slice(2);

interface Args {
  campaignId: String,
  dataDir: PathLike,
  patreonUrl: String,
}

function parseArgs(args: String[]): Args {
  let result: Partial<Args> = {};
  for (let i = 0; i < args.length; i+=2) {
    const name = args[i];
    const val = args[i+1];
    switch (name) {
      case "--campaign_id":
        result.campaignId = val;
        break;
      case "--data_dir":
        result.dataDir = val as PathLike;
        break;
      case "--patreon_url":
        result.patreonUrl = val;
        break;
      default:
    }
  }

  if (!result.campaignId) throw new Error("--campaign_id missing");
  if (!result.dataDir) throw new Error("--data_dir missing");
  if (!result.patreonUrl) throw new Error("--patreon_url missing");
  return result as Args;
}

