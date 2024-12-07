const p = require('@prisma/client').PrismaClient;
const prisma = new p();

// prisma.user.update({ data: { email: 'son@gmail.com' }, where: { id: 4 } }).then((users) => {
//   console.log({ users });
// });

prisma.rating
  .findMany({
    where: { userId: 3 },
    take: 8,
    select: { post: { select: { slug: true, title: true } } },
  })
  .then((p) => console.log({ p }));
