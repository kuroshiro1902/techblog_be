import { Elastic } from "@/database/database";
import { ENVIRONMENT } from "@/common/environments/environment";
import dotenv from 'dotenv';
dotenv.config();

const UPDATE_MAPPING = {
  properties: {
    embedding: {
      type: "dense_vector",
      dims: 768,
      index: true,
      similarity: "cosine"
    }
  }
};

export const updatePostIndex = async () => {
  console.log({ Elastic });

  if (!Elastic) return;

  try {
    // Cập nhật mapping cho index hiện tại
    await Elastic.indices.putMapping({
      index: ENVIRONMENT.ELASTIC_POST_INDEX,
      ...UPDATE_MAPPING
    });

    console.log('Updated mapping successfully');
  } catch (error) {
    console.error('Error updating mapping:', error);
    throw error;
  }
}; 