"use client";

import React, { useState } from "react";
import UserCard from "./user-card";

export interface User {
  name: string;
  intro: string;
}

const HomePage = () => {
  const [user, setUser] = useState({ name: "Vivek", intro: "youtuber" });
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <UserCard user={user} />
    </div>
  );
};

export default HomePage;
