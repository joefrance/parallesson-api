import fs from 'fs';
//import axios from 'axios';
import htmlHelper from '../helpers/htmlHelpers.js';

let sources = JSON.parse(fs.readFileSync('./p9n-source-index.json', 'utf-8'));

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