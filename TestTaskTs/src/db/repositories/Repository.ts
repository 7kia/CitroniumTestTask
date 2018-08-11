import {IDatabase, IMain} from "pg-promise";
/**
 * Created by Илья on 07.08.2018.
 */

export class Repository {
  public static getSelectQueueString(
      searchPlace: string,
      criterias: {[id: string]: any},
  ): string {
      const stringCriteria: string = Repository.generateCriteriaString(criterias);

      return "SELECT * FROM public.\"" + searchPlace + "\" " +
          "WHERE " + stringCriteria;
  }
  public static generateCriteriaString(criterias: {[id: string]: any}): string {
    let stringCriteria: string = "";
    for (const key in criterias) {
      if (criterias.hasOwnProperty(key)) {
        if (stringCriteria.length > 1) {
          stringCriteria = stringCriteria + " and ";
        }
        stringCriteria = stringCriteria + key + "=\'"  + criterias[key] + "\'";
      }
    }

    return stringCriteria;
  }
  public static getInsertQueueString(
    insertPlace: string,
    data: {[id: string]: any},
  ): string {
      const valueString: string = Repository.generateValueString(data);
      const propertyString: string = Repository.generatePropertyString(data);

      return "INSERT INTO public.\"" + insertPlace + "\"("
        + propertyString + ")"
        + "VALUES (" + valueString + ")";
  }
  public static generateValueString(data: {[id: string]: any}): string {
    let valueString: string = "";
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (valueString.length > 1) {
          valueString = valueString + ", ";
        }
        valueString = valueString + "\'" + data[key] + "\'";
      }
    }

    return valueString;
  }
  public static generatePropertyString(data: {[id: string]: any}): string {
    let propertyString: string = "";
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (propertyString.length > 1) {
          propertyString = propertyString + ", ";
        }
        propertyString = propertyString + key;
      }
    }

    return propertyString;
  }
  public static getDeleteQueueString(
    insertPlace: string,
    criterias: {[id: string]: any},
  ): string {
    const stringCriteria: string = Repository.generateCriteriaString(criterias);
    return "DELETE FROM public.\"" + insertPlace + "\" "
      + "WHERE " + stringCriteria + "";
  }

  protected db: IDatabase<any>;
  protected pgp: IMain;
  public constructor(db: any, pgp: IMain) {
    this.db = db;
    this.pgp = pgp;
  }
}
