/**
 * Created by Илья on 07.08.2018.
 */
import {IDatabase, IMain} from "pg-promise";
import * as Collections from "typescript-collections";
import {DataForCreation} from "../../Helpers";

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
    if ((value === null) || (value === undefined)) {
      return null;
    }
    return value.toString();
  }
  private static generateString(
    data: DataForCreation,
    delimiter: string,
    generateValue: (key: string, value: string) => string,
  ): string {
    let criteriaString: string = "";
    for (const key of data.keys()) {
      if (data.containsKey(key) ) {
        if (criteriaString.length > 1) {
          criteriaString = criteriaString + delimiter;
        }
        criteriaString = criteriaString + generateValue(key, Repository.generateStringValue(data.getValue(key)));
      }
    }
    return criteriaString;
  }

  public static getSelectQueueString(
      searchPlace: string,
      criterias: DataForCreation,
  ): string {
      const criteriaString: string = Repository.generateCriteriaString(criterias);

      return "SELECT * FROM public.\"" + searchPlace + "\" " +
          "WHERE " + criteriaString;
  }
  public static generateCriteriaString(criterias: DataForCreation): string {
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
  public static generateNewDataString(criterias: DataForCreation): string {
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
    data: DataForCreation,
  ): string {
      const valueString: string = Repository.generateValueString(data);
      const propertyString: string = Repository.generatePropertyString(data);

      return "INSERT INTO public.\"" + insertPlace + "\"("
        + propertyString + ")"
        + "VALUES (" + valueString + ")";
  }
  public static generateValueString(data: DataForCreation): string {
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
  public static generatePropertyString(data: DataForCreation): string {
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
    criterias: DataForCreation,
  ): string {
    const criteriaString: string = Repository.generateCriteriaString(criterias);
    return "DELETE FROM public.\"" + insertPlace + "\" "
      + "WHERE " + criteriaString + "";
  }

  public static getUpdateQueueString(
    insertPlace: string,
    criterias: DataForCreation,
    newData: DataForCreation,
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
