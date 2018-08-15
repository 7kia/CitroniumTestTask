import {IDatabase, IMain} from "pg-promise";
/**
 * Created by Илья on 07.08.2018.
 */

export class Repository {
  private static generateStringValue(value: any) {
    if (Array.isArray(value)) {
      let result: string = "{";
      for (const element of value) {
        if (result.length > 1) {
          result = result + ", ";
        }
        result += "\"" + element + "\"";
      }
      result += "}";
      return result;
    }
    if (value === null) {
      return null;
    }
    return value.toString();
  }
  private static generateString(
    data: {[id: string]: any},
    delimiter: string,
    generateValue: (key: string, value: string) => string,
  ): string {
    let criteriaString: string = "";
    for (const key in data) {
      if (data.hasOwnProperty(key) ) {//&& (data[key] !== null)
        if (criteriaString.length > 1) {
          criteriaString = criteriaString + delimiter;
        }
        criteriaString = criteriaString + generateValue(key, Repository.generateStringValue(data[key]));
      }
    }
    return criteriaString;
  }

  public static getSelectQueueString(
      searchPlace: string,
      criterias: {[id: string]: any},
  ): string {
      const criteriaString: string = Repository.generateCriteriaString(criterias);

      return "SELECT * FROM public.\"" + searchPlace + "\" " +
          "WHERE " + criteriaString;
  }
  public static generateCriteriaString(criterias: {[id: string]: any}): string {
    return Repository.generateString(
      criterias,
      " and ",
      (key: string, value: string): string => {
        if (value) {
          return key + "=\'"  + value + "\'";
        }
        return key + "=null";
      },
    );
  }
  public static generateNewDataString(criterias: {[id: string]: any}): string {
    return Repository.generateString(
      criterias,
      ", ",
      (key: string, value: string): string => {
        if (value) {
          return key + "=\'" + value + "\'";
        }
        return key + "=null";
      },
    );
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
    return Repository.generateString(
      data,
      ", ",
      (key: string, value: string): string => {
        if (value) {
          return "\'" + value + "\'";
        }
        return "null";
      },
    );
  }
  public static generatePropertyString(data: {[id: string]: any}): string {
    return Repository.generateString(
      data,
      ", ",
      (key: string, value: string): string => {
        return key;
      },
    );
  }
  public static getDeleteQueueString(
    insertPlace: string,
    criterias: {[id: string]: any},
  ): string {
    const criteriaString: string = Repository.generateCriteriaString(criterias);
    return "DELETE FROM public.\"" + insertPlace + "\" "
      + "WHERE " + criteriaString + "";
  }

  public static getUpdateQueueString(
    insertPlace: string,
    criterias: {[id: string]: any},
    newData: {[id: string]: any},
  ): string {
    const criteriaString: string = Repository.generateCriteriaString(criterias);
    const newDataString: string = Repository.generateNewDataString(newData);

    return "UPDATE public.\"" + insertPlace + "\""
      + " SET " + newDataString
      + " WHERE " + criteriaString;
  }

  protected db: IDatabase<any>;
  protected pgp: IMain;
  public constructor(db: any, pgp: IMain) {
    this.db = db;
    this.pgp = pgp;
  }
}
