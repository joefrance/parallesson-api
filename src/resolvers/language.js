import fs from 'fs';
//import axios from 'axios';
import htmlHelper from '../helpers/htmlHelpers.js';

let adventechLangauges = JSON.parse(fs.readFileSync('./p9n-language-index-adventech.json', 'utf-8'));
//console.log(adventechLangauges)

const languageResolver = {
    Query: {
        //getlanguages(source_id: ID!)
        getlanguage: (root, args, context, info) => {
            const {id} = args
            const {db} = context
            {
                console.log(id)
                const splits = id.split('/');

                if(splits[0] === 'adventech') {
                    var languageFound = adventechLangauges.filter(language => language.language_id.toString() === id.toString())[0];
                    if(languageFound) {
                        return languageFound;
                    }
                }

                return null;

            }
        },

        getlanguages: (parent, args, { db }, info) => {
            const {source_id} = args
            //console.log("getlanguages")
            if(source_id === 'adventech') {
                return adventechLangauges;
            } 
            return [];
        }
    }
}

export default languageResolver