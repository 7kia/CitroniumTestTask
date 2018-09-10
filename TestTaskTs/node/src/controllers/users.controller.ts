import {Request, Response} from "express";
import {postgreSqlManager} from "../db/index";
import {DataForCreation} from "../Helpers";
import Dictionary from "typescript-collections/dist/lib/Dictionary";
import {User} from "../db/Entity/User";

export const getUser = async (req: Request, res: Response) => {
  const userData: DataForCreation = new Dictionary<string, {}>();
  userData.setValue("name", req.params.name);
  userData.setValue("password", req.params.password);

  try {
    const foundUser: User = await postgreSqlManager.users.find(userData);
    
    res.send({name: foundUser.name, password: foundUser.password});
  } catch (error) {
    res.statusCode(404);
    res.statusMessage(error);
  }
};