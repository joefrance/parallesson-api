import htmlHelper from '../helpers/htmlHelpers.js';
import sourceResolver from './source.js'

const rootResolver = {
    Query: {
        getHtmlSource: (root, args, context, info) => {
            const {url} = args
            const {db} = context
            {
                console.log(url);
                var result = htmlHelper.getSouceFromUrl(url);
                //console.log(`${url}`, html);
                return result;
            }
        },

    }
}


const resolvers = [
    rootResolver,
    sourceResolver
]

export default resolvers