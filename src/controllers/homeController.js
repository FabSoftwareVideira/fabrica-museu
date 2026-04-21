const homeController = async (request, reply) => {
    return reply.view('index.hbs', {
        pageTitle: 'Museu do Vinho Mario Pellegrin',
        year: new Date().getFullYear(),
    });
};

module.exports = { homeController };
