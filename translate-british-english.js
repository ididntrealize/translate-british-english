


//HOW TO USE THIS SCRIPT
//Do it like this:
/*
var exampleString = 'This product has a beautiful colour, any organisation could benefit from 15m of it. it carries 980ml of water, and weighs 15kg.';
translateAUStoUS(exampleString);
*/




//This JSON object controls what will be converted into what, and how.
//note that only 'in' will be converted into 'X ft and Y in'
let conversionDetails = {

	'ml' : { newUnit: 'oz', multiplier:  0.0352 },
	'l'  : { newUnit: 'oz', multiplier: 35.195  },
	'mm' : { newUnit: 'in', multiplier:  0.0394 },
	'cm' : { newUnit: 'in', multiplier:  0.3937 },
	'm'  : { newUnit: 'in', multiplier: 39.37   },
	'g'  : { newUnit: 'oz', multiplier:  0.0353 },
	'kg' : { newUnit: 'lb', multiplier:  2.2046 }
};

//sometimes the number - unit combinations have special characters appearing directly after, these are accounted for:
let unitPunctuation = [' ', '.', ',', ':', ';', '!', '?', '-', '<'];

//main function will take a description and return it 
	//without metrics or british english spelling
function translateBritishEnglish(strToTranslate, debug){

	 //do nothing for null, blank strings, etc.
    if(strToTranslate !== null && strToTranslate !== '' && strToTranslate !== undefined){

        console.log("==============================")
        console.log('The following translations happened:')

        let newHTML = strToTranslate;

        function translateMeasurements(fullText){

            let newStr = fullText;

            //collect units to convert from JSON obj above
            let unitsToConvert = [];
                    for(var k in conversionDetails) unitsToConvert.push(k);
                if(debug){ console.log("units to convert", unitsToConvert) }

            //match any combination of number - unit - random punctuation
                let regExStr  = "(\\d+\\.?\\d*)+ ?(";
                    regExStr += unitsToConvert.join("|");
                    regExStr += ")(";
                    regExStr += "\\" + unitPunctuation.join("|\\");
                    regExStr += ")+";
                    
                let myRegEx = new RegExp(regExStr, 'gi');
                let match = myRegEx.exec(fullText);

            //review each match found
                while (match != null) {

                    let replaceThis = match[0]; // 12.56 cm
                    let origValue = match[1];   // 12.56
                    let currUnits = match[2];   // cm
                    let lastThing = match[3];   // <

                        //using the multiplier from the corresponding unit conversion.
                        let converted = origValue * conversionDetails[currUnits].multiplier;

                        //inches needs to change into feet and inches:
                        if(conversionDetails[currUnits].newUnit == "in"){

                            if(converted/12 >= 1){
                                let feet = Math.floor(converted/12);
                                let inches = Math.round(converted%12);

                                //over 50 ft, inches don't matter:
                                if(feet > 10){
                                    converted = feet + "ft ";
                                }else if(feet >= 1){
                                    converted = Math.round(converted) + " in." ;
                                }else{
                                    converted = Math.round(converted * 10)/10 + " in." ;
                                }

                            }else{
                                let inches = Math.round(converted);

                                //if inches would otherwise be 0
                                if(inches == 0){
                                    converted = "0.5" + " in.";
                                }else{
                                    converted = inches + " in.";
                                }
                            }

                        }else{



                        //everything else needs a supplementary rounded decimal situation.. 
                            //and corresponding unit abbreviation
                            converted = Math.round(converted * 10)/10 + " " + conversionDetails[currUnits].newUnit + "."; 

                        }

                        //let oldNumberAndUnit = ' (' + replaceThis.replace("<", "").replace(" ", "") + ')';

                        //replace any strange punctuation/ special charaecteres:
                            converted = converted + lastThing; // 34 in. <

                        
                    newStr = newStr.replace(replaceThis, converted );
                    if (debug){ console.log(replaceThis + ' => ' + converted) }


                        match = myRegEx.exec(fullText);

                }



            //feeds back original string with any need changes made
            return newStr;
        }

        function translateEnglish(fullText){

            let newStr = fullText;

            //split all words into an array, discounting HTML tags
            let tagsToSpaces = fullText.replace(/(<([^>]+)>)/ig," "),
                wordsToCheck = tagsToSpaces.split(' ');

                //check each word in passed string with the spelling diff lookup table
                wordsToCheck.forEach(function(elem){
                    let formatted = elem.toLowerCase();
                        formatted = formatted.replace(/[^a-zA-Z ]/g, "");
                    
                    if(spellingDifferences[formatted]){

                        let anythingRevomed = elem.replace(/[a-zA-Z ]/g, "");

                        //AUS English word found, replace it (with any random formatting associated)
                        newStr = newStr.replace(elem, spellingDifferences[formatted] + anythingRevomed);
                        
                        if(debug){ console.log(elem + ' => ' + spellingDifferences[formatted] + anythingRevomed) }
                        
                    }
                });

            return newStr;

        }

        //return the exact string of html other than changed measurements and British English 
        return translateEnglish(translateMeasurements(newHTML));

    }


}



