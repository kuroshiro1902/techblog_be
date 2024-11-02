import { syncPostToElasticSearchJob } from "./syncPostToElasticSearch.job"


export const JobServer = async () => {
  syncPostToElasticSearchJob();
}