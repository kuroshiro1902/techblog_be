import { Elastic } from "@/database/database";
import { ENVIRONMENT } from "@/common/environments/environment";

const POST_MAPPING = {
  mappings: {
    properties: {
      id: { type: "long" },
      title: {
        type: "text",
        analyzer: "vietnamese",
        fields: {
          keyword: { type: "keyword" },
          completion: {
            type: "completion",
            analyzer: "vietnamese"
          }
        }
      },
      content: {
        type: "text",
        analyzer: "vietnamese",
        index_options: "offsets"
      },
      description: {
        type: "text",
        analyzer: "vietnamese"
      },
      slug: {
        type: "keyword",
        ignore_above: 255
      },
      isPublished: { type: "boolean" },
      views: { type: "long" },
      ratings: {
        properties: {
          likes: { type: "long" },
          dislikes: { type: "long" }
        }
      },
      createdAt: { type: "date" },
      author: {
        properties: {
          id: { type: "long" },
          name: {
            type: "text",
            analyzer: "vietnamese",
            fields: {
              keyword: { type: "keyword" }
            }
          }
        }
      },
      categories: {
        properties: {
          id: { type: "long" },
          name: {
            type: "text",
            analyzer: "vietnamese",
            fields: {
              keyword: { type: "keyword" }
            }
          }
        }
      }
    }
  },
  settings: {
    analysis: {
      analyzer: {
        vietnamese: {
          tokenizer: "standard",
          filter: [
            "lowercase",
            "asciifolding",
            "vietnamese_stop"
          ]
        }
      },
      filter: {
        vietnamese_stop: {
          type: "stop",
          stopwords: ["và", "hoặc", "trong", "các", "những", "của", "với", "để", "có", "được", "này", "cho", "khi", "là"]
        }
      }
    }
  }
}



export const createPostIndex = async () => {
  if (!Elastic) return;

  const indexExists = await Elastic.indices.exists({
    index: ENVIRONMENT.ELASTIC_POST_INDEX
  });

  if (!indexExists) {
    await Elastic.indices.create({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      ...POST_MAPPING
    });
  }
};