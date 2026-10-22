import {ViewEntity, ViewColumn} from "typeorm";

@ViewEntity({ name: "v_user",  schema: "public" })
export class UserView {
    @ViewColumn({ name: "user_id" })
    userId: number;

    @ViewColumn({ name: "name" })
    name: string;

    @ViewColumn({ name: "email" })
    email: string;

    @ViewColumn({ name: "login" })
    login: string;

    @ViewColumn({ name: "role_name" })
    roleName: string;
}

