import { Elastic } from "@/database/database";
import { syncPostToElasticSearchJob } from "./syncPostToElasticSearch.job"
import { updateMissingEmbeddingsJob } from "./updateMissingEmbedding.job";


export const JobServer = async () => {
  if (!Elastic) {
    return;
  }
  syncPostToElasticSearchJob().catch(err => { });
  // updateMissingEmbeddingsJob().catch(err => { });
}