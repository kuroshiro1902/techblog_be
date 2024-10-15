import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed data for posts
  const post1 = await prisma.post.create({
    data: {
      title: 'First Post',
      slug: 'first-post',
      content: '<p><strong>Hello</strong><br>This is the content of the first post.</p>',
      published: true,
      author: { connect: { id: 2 } },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Second Post',
      slug: 'second-post',
      content: '<p><strong>Hello</strong><br>This is the content of the first post.</p>',
      published: false,
      author: { connect: { id: 3 } },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    console.log('before exit');

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

process.on('SIGINT', (s) => {
  console.log('exit: ', s);
});
