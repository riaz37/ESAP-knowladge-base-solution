"use client";

import React from "react";
import { UserConfigManager, UserConfigDemo } from "@/components/user-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UserConfigPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="manager" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manager">User Config Manager</TabsTrigger>
          <TabsTrigger value="demo">Company Integration Demo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="manager" className="mt-6">
          <UserConfigManager />
        </TabsContent>
        
        <TabsContent value="demo" className="mt-6">
          <UserConfigDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
}