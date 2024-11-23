const p = require('@prisma/client').PrismaClient;
const prisma = new p();

prisma.user.findMany().then((users) => {
  console.log({ users });
});
