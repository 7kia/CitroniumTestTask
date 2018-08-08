/**
 * Created by Илья on 07.08.2018.
 */

export class Repository {
    public static getSelectQueueString(
        searchPlace: string,
        criterias: {[id: string]: string},
    ): string {
        const stringCriteria: string = Repository.generateCriteriaString(criterias);

        return "SELECT * FROM public.\"" + searchPlace + "\" " +
            "WHERE " + stringCriteria;
    }

    public static generateCriteriaString(criterias: {[id: string]: string}): string {
        let stringCriteria: string = "";
        let index = 1;
        for (const key in criterias) {
            if (criterias.hasOwnProperty(key)) {
                if (stringCriteria.length > 1) {
                    stringCriteria = stringCriteria + " and ";
                }
                stringCriteria = stringCriteria + key + "=\'"  + criterias[key] + "\'";
                // criterias[key]
            }
        }

        return stringCriteria;
    }
}
