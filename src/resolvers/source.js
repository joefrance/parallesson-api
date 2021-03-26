//import axios from 'axios';
import htmlHelper from '../helpers/htmlHelpers.js';

const sources = [
    {
        source_id: 1,
        source_name: "egwwritings",
        source_desc: "The Complete Published Writings of Ellen White are now available online in several languages. The latest version allows you to easily browse, read, search, and share the writings in Chinese, English, French, German, Italian, Portuguese, Romanian, Russian, and Spanish. There are currently a total of 130 various languages available.",
        source_url: "https://m.egwwritings.org/languages",
        source_logo: "https://m.egwwritings.org/images/logo.svg",
        source_repo: null
    },
    {
        source_id: 2,
        source_name: "adventech",
        source_desc: "Adventech Ministry - Our mission is to use technology for the Glory of the Lᴏʀᴅ",
        source_url: "http://adventech.io",
        source_logo: "https://adventech.io/images/adventech-menu-logo.png",
        source_repo: "https://github.com/Adventech"
    },
    {
        source_id: 3,
        source_name: "gutenberg-http",
        source_desc: "The gutenberg.org project is a fantastic resource for public domain books. This API makes the wealth of information curated by Project Gutenberg available via a simple interface.",
        source_url: "https://justamouse.com/gutenberg-http/",
        source_logo: "http://www.gutenberg.org/gutenberg/pg-logo-129x80.png",
        source_repo: "https://github.com/c-w/gutenberg-http/"
    }
]
const sourceResolver = {
    Query: {
        getsource: (root, args, context, info) => {
            const {id} = args
            const {db} = context
            {
                var sourceFound = sources.filter(source => source.source_id.toString() === id.toString())[0];
                if(sourceFound) {
                    return sourceFound;
                }
            }
        },

        getsources: (parent, args, { db }, info) => {
            return sources;
        }
    }
}

export default sourceResolver