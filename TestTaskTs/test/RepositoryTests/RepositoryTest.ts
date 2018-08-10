/**
 * Created by Илья on 08.08.2018.
 */
import { assert } from "chai";
import "mocha";
import {Repository} from "../../src/db/repositories/Repository";


describe("Класс Repository. " +
    "Основа для всех репозиториев. Содержит в себе соединение с PostgreSQL и " +
    "общие для всех репозиториев операции.", () => {
    it("Может генерировать строку с критериями поиска.", () => {
        assert.strictEqual(
            Repository.generateCriteriaString({id: "1"}),
            "id=\'1\'",
        );
        assert.strictEqual(
            Repository.generateCriteriaString({id: "2", name: "Player1"}),
            "id=\'2\' and name=\'Player1\'",
        );
        assert.strictEqual(
            Repository.generateCriteriaString({id: "2", name: "Player1", email: "e@e.com"}),
            "id=\'2\' and name=\'Player1\' and email=\'e@e.com\'",
        );
    });
    it("Может генерировать строку c SELECT запросом.", () => {
        assert.strictEqual(
            Repository.getSelectQueueString("User", {id: "1"}),
            "SELECT * " +
            "FROM public.\"User\" " +
            "WHERE id=\'1\'",
        );
        assert.strictEqual(
            Repository.getSelectQueueString("Player", {id: "2", name: "Player1"}),
            "SELECT * " +
            "FROM public.\"Player\" " +
            "WHERE id=\'2\' and name=\'Player1\'",
        );
        assert.strictEqual(
            Repository.getSelectQueueString("Player", {id: "2", name: "Player1", email: "e@e.com"}),
            "SELECT * " +
            "FROM public.\"Player\" " +
            "WHERE id=\'2\' and name=\'Player1\' and email=\'e@e.com\'",
        );
    });
    it("Может генерировать строку с INSERT запросом.", () => {
        assert.strictEqual(
          Repository.getInsertQueueString("User", {id: "1"}),
          "INSERT INTO public.\"User\"(id)"
          + "VALUES ('1')",
        );
        assert.strictEqual(
          Repository.getInsertQueueString("Player", {name: "Player1", email: "e4@e.com"}),
          "INSERT INTO public.\"Player\"(name, email)"
          + "VALUES ('Player1', 'e4@e.com')",
        );
    });
    it("Может генерировать строку с DELETE запросом.", () => {
        assert.strictEqual(
          Repository.getDeleteQueueString("User", {id: "1"}),
          "DELETE FROM public.\"User\" "
          + "WHERE id=\'1\'",
        );
        assert.strictEqual(
          Repository.getDeleteQueueString("Player", {name: "Player1", email: "e4@e.com"}),
          "DELETE FROM public.\"Player\" "
          + "WHERE name=\'Player1\' and email=\'e4@e.com\'",
        );
    });
});
