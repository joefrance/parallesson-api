import htmlHelper from '../helpers/htmlHelpers.js';
import languageResolver from './language.js';
import sourceResolver from './source.js';

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
    languageResolver,
    sourceResolver
]

export default resolvers