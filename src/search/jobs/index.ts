import { Elastic } from "@/database/database";
import { syncPostToElasticSearchJob } from "./syncPostToElasticSearch.job"


export const JobServer = async () => {
  if (!Elastic) {
    return;
  }
  syncPostToElasticSearchJob().catch(err => { });
}