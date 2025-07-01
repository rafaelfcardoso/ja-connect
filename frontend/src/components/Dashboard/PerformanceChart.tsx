
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  {
    name: "Jan",
    leads: 65,
    qualificados: 28,
    contratos: 15,
  },
  {
    name: "Fev",
    leads: 59,
    qualificados: 25,
    contratos: 12,
  },
  {
    name: "Mar",
    leads: 80,
    qualificados: 45,
    contratos: 23,
  },
  {
    name: "Abr",
    leads: 81,
    qualificados: 54,
    contratos: 31,
  },
  {
    name: "Mai",
    leads: 96,
    qualificados: 62,
    contratos: 42,
  },
  {
    name: "Jun",
    leads: 109,
    qualificados: 70,
    contratos: 45,
  },
];

export default function PerformanceChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Performance do Funil</CardTitle>
        <div className="text-xs text-muted-foreground">Últimos 6 meses</div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Line
                type="monotone"
                dataKey="leads"
                stroke="#9f75ff"
                strokeWidth={2}
                dot={{ fill: "#9f75ff", r: 4 }}
                activeDot={{ r: 6 }}
                name="Leads"
              />
              <Line
                type="monotone"
                dataKey="qualificados"
                stroke="#64B5F6"
                strokeWidth={2}
                dot={{ fill: "#64B5F6", r: 4 }}
                activeDot={{ r: 6 }}
                name="Qualificados"
              />
              <Line
                type="monotone"
                dataKey="contratos"
                stroke="#4CAF50"
                strokeWidth={2}
                dot={{ fill: "#4CAF50", r: 4 }}
                activeDot={{ r: 6 }}
                name="Contratos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
