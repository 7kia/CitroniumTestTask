/**
 * Created by Илья on 07.08.2018.
 */
class Repository {
    public static getSelectQueueString(
        searchPlace: string,
        criterias: {[id: string]: string},
    ): string {
        const stringCriteria: string = this.generateCriteriaString(criterias);

        return "SELECT object FROM public.\"" + searchPlace + "\"" +
            "WHERE " + stringCriteria;
    }

    public static generateCriteriaString(criterias: {[id: string]: string}): string {
        let stringCriteria: string = "";
        for (const criteria of criterias) {
            if (stringCriteria.length > 1) {
                stringCriteria = stringCriteria + " and ";
            }

            stringCriteria = stringCriteria + " object." + criteria.key + "=\""  + criteria.value + "\"";
        }

        return stringCriteria;
    }
}

export {
    Repository,
};
