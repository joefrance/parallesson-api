
const pageResolver = {
    Query: {
        getpage: (root, args, context, info) => {
            const {id} = args
            const {db} = context
            {
                var pageFound = pages.filter(page => page.page_id.toString() === id.toString())[0];
                if(pageFound) {
                    return pageFound;
                }
            }
        },

        getpages: (parent, args, { db }, info) => {
            return pages;
        }
    }
}

export default pageResolver