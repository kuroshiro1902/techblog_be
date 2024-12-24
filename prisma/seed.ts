import dotenv from 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { fa, faker } from '@faker-js/faker';
import slugify from 'slugify';
import { AuthService } from '../src/user/services/auth.service';

const prisma = new PrismaClient();

function getRandomThumbnailUrl() {
  // Sinh ngẫu nhiên giá trị width từ 300 đến 600
  const width = Math.floor(Math.random() * (600 - 300 + 1)) + 300;

  // Xác suất 60% tỉ lệ là 1, 40% tỉ lệ ngẫu nhiên từ 0.5 đến 2
  const ratio = Math.random() < 0.6 ? 1 : Math.random() * (2 - 0.5) + 0.5;

  // Tính height dựa trên tỉ lệ width/height
  const height = Math.floor(width / ratio);

  // Tạo URL với width và height được sinh ra
  const thumbnailUrl = faker.image.urlPicsumPhotos({
    width,
    height,
  });

  return thumbnailUrl;
}

async function seedPosts() {
  const authors = [1, 2, 3, 4];

  // Tạo 100 bài viết ngẫu nhiên
  for (let i = 0; i < 100; i++) {
    const randomAuthorId = authors[Math.floor(Math.random() * authors.length)];

    // Tạo tiêu đề ngẫu nhiên
    const title = faker.lorem.sentence({ min: 5, max: 15 });

    // Tạo slug từ tiêu đề, loại bỏ ký tự đặc biệt và thay thế khoảng trắng bằng dấu '-'
    const slug = slugify(title, {
      trim: true,
      lower: true, // Chuyển thành chữ thường
      strict: true, // Loại bỏ các ký tự đặc biệt
      locale: 'vi', // Hỗ trợ ngôn ngữ Tiếng Việt (đối với các dấu)
    });

    // Tạo nội dung ngẫu nhiên và bọc trong thẻ <p> và <br>
    const content = faker.lorem
      .paragraphs({ min: 3, max: 10 })
      .split('\n') // Tách các đoạn văn dựa trên ký tự xuống dòng
      .map((p) => `<p>${p}</p>`) // Mỗi đoạn văn được bao trong thẻ <p>
      .join('<br>'); // Thêm <br> để xuống dòng

    await prisma.post.create({
      data: {
        title, // Tiêu đề
        slug, // Slug được sinh từ tiêu đề
        content, // Nội dung với thẻ <p> và <br>
        isPublished: Math.random() < 0.75,
        author: { connect: { id: randomAuthorId } }, // Tác giả ngẫu nhiên
        thumbnailUrl: getRandomThumbnailUrl(),
      },
    });
  }

  console.log('Seeded 100 posts successfully');
}

const seedRoles = async () => {
  const roles = await prisma.role.createMany({ data: [{ name: 'user' }, { name: 'admin' }] });
  console.log(roles);
}

async function seedCategories() {
  // Tạo danh mục Frontend và Backend
  const frontend = await prisma.category.create({
    data: {
      name: 'Frontend',
    },
  });

  const backend = await prisma.category.create({
    data: {
      name: 'Backend',
    },
  });

  // Tạo danh mục Nodejs với Backend là danh mục cha
  await prisma.category.create({
    data: {
      name: 'Nodejs',
      // parents: {
      //   connect: { id: backend.id }, // Kết nối với Backend
      // },
    },
  });

  console.log('Categories seeded successfully!');

}

async function addCategoryToPost(postId: number, categoryId: number) {
  try {
    // Cập nhật bài viết với category
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        categories: {
          connect: { id: categoryId }, // Kết nối với category có ID 3
        },
      },
    });

    console.log('Post updated successfully:', updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function setDefaultStatusPosts() {
  const posts = await prisma.post.findMany({ select: { id: true } });
  const a = await prisma.postLog.createMany({ data: posts.map((post) => ({ postId: post.id, status: "NOT_SYNCED" })) });
  console.log(a.count);
}

// prisma.userFavoritePost.findMany().then((d) => console.log({ d }, d[0].userId)
// )

async function seedUsers() {
  // Danh sách họ và tên đệm phổ biến
  const lastNames = ['Trần', 'Lê', 'Phạm', 'Nguyễn', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng'];
  const middleNames = ['Vũ', 'Đức', 'Minh', 'Linh', 'Quân', 'Dương', 'Công', 'Quang', 'Thu', 'Thanh'];

  await AuthService.signup({
    name: 'Bùi Thanh Sơn',
    username: `kuroshiro1902`,
    password: '123456',
    email: `kuroshiro1902@gmail.com`,
    description: faker.person.bio(),
  } as any);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName();
      const middleName = middleNames[i];
      const lastName = lastNames[i];
      const fullName = `${lastName} ${middleName} ${firstName}`;

      await AuthService.signup({
        name: fullName,
        username: `username${i + 1}`,
        password: '123456',
        email: `user${i + 1}@example.com`,
        avatarUrl: faker.image.avatar(),
        description: faker.person.bio(),
      } as any);
      // delay 0.5s
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`Created user: ${fullName} (username${i + 1})`);
    }

    console.log('Seeded 10 users successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Chạy seed

seedUsers()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
