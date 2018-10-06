/**
 * Created by Илья on 08.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {Repository} from "../../src/db/repositories/Repository";
import {User} from "../../src/db/Entity/User";
import {DataForCreation} from "../../src/Helpers";
import * as Collections from "typescript-collections";

describe("Класс Repository. " +
  "Основа для всех репозиториев. Содержит в себе соединение с PostgreSQL и " +
  "общие для всех репозиториев операции.",
         () => {
    const data: DataForCreation = new Collections.Dictionary<string, any>();
    data.setValue("id", 1);
    const data2: DataForCreation = new Collections.Dictionary<string, any>();
    data2.setValue("id", 2);
    data2.setValue("name", "Player1");
    data2.setValue("email", "e@e.com");
    data2.setValue("password", null);
    describe("Может генерировать строки с данными для запроса.", () => {
      it("Может генерировать строку критерий поиска.", () => {
        assert.strictEqual(
          Repository.generateCriteriaString(data),
          "id='1'",
        );
        assert.strictEqual(
          Repository.generateCriteriaString(data2),
          "id='2' and name='Player1' and email='e@e.com' and password=null",
        );
      });
      it("Может генерировать строку с данными для обновления.", () => {
        assert.strictEqual(
          Repository.generateNewDataString(data),
          "id='1'",
        );
        assert.strictEqual(
          Repository.generateNewDataString(data2),
          "id='2', name='Player1', email='e@e.com', password=null",
        );
      });
      it("Может генерировать строку со свойствами.", () => {
        assert.strictEqual(
          Repository.generatePropertyString(data),
          "id",
        );
        assert.strictEqual(
          Repository.generatePropertyString(data2),
          "id, name, email, password",
        );
      });
      it("Может генерировать строку со значениями для запроса добавления.", () => {
        assert.strictEqual(
          Repository.generateValueString(data),
          "'1'",
        );
        assert.strictEqual(
          Repository.generateValueString(data2),
          "'2', 'Player1', 'e@e.com', null",
        );
      });
    });

    describe("Может генерировать строку запроса.", () => {
    it("Может генерировать строку c SELECT запросом.", () => {
      assert.strictEqual(
        Repository.getSelectQueueString("User", data),
        "SELECT * " +
        "FROM public.\"User\" " +
        "WHERE id='1'",
      );
      assert.strictEqual(
        Repository.getSelectQueueString("Player", data2),
        "SELECT * " +
        "FROM public.\"Player\" " +
        "WHERE id='2' and name='Player1' and email='e@e.com' and password=null",
      );
  });
    it("Может генерировать строку с INSERT запросом.", () => {
    assert.strictEqual(
      Repository.getInsertQueueString("User", data),
      "INSERT INTO public.\"User\"(id)"
      + "VALUES ('1')",
    );
    assert.strictEqual(
      Repository.getInsertQueueString("Player", data2),
      "INSERT INTO public.\"Player\"(id, name, email, password)"
      + "VALUES ('2', 'Player1', 'e@e.com', null)",
    );
  });
    it("Может генерировать строку с DELETE запросом.", () => {
      assert.strictEqual(
        Repository.getDeleteQueueString("User", data),
        "DELETE FROM public.\"User\" "
        + "WHERE id='1'",
      );
      assert.strictEqual(
        Repository.getDeleteQueueString("Player", data2),
        "DELETE FROM public.\"Player\" "
        + "WHERE id='2' and name='Player1' and email='e@e.com' and password=null",
      );
    });
    it("Может генерировать строку с UPDATE запросом.", () => {
      const updateValues: DataForCreation = new Collections.Dictionary<string, any>();
      updateValues.setValue("name", "newName");
      updateValues.setValue("email", "new@new.com");
      assert.strictEqual(
        Repository.getUpdateQueueString("User", data, updateValues),
        "UPDATE public.\"User\" "
        + "SET name='newName', email='new@new.com' "
        + "WHERE id='1'",
      );
    });
  });
  },
);
