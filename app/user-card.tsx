import React from "react";
import { User } from "./page";

const UserCard = ({ user }: { user: User }) => {
  user.intro = "human";
  return (
    <div className="flex flex-col gap-2">
      <h1>{user.name}</h1>
      <p>{user.intro}</p>
    </div>
  );
};

export default UserCard;
