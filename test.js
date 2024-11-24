const p = require('@prisma/client').PrismaClient;
const prisma = new p();

// prisma.user.update({ data: { email: 'son@gmail.com' }, where: { id: 4 } }).then((users) => {
//   console.log({ users });
// });

prisma.rating
  .updateMany({ data: { score: 1 }, where: { score: { gte: 1 } } })
  .then((ratings) => {
    console.log({ ratings });
  });
