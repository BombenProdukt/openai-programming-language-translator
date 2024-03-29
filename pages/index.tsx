import endent from "endent";
import Head from "next/head";

import { Layout } from "@/components/layout";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Configuration, OpenAIApi } from "openai";

const Languages = [
  "Assembly Language",
  "Bash",
  "C",
  "C#",
  "C++",
  "Clojure",
  "COBOL",
  "CSS",
  "Dart",
  "Elixir",
  "Fortran",
  "Go",
  "Groovy",
  "Haskell",
  "HTML",
  "Java",
  "JavaScript",
  "JSX",
  "Julia",
  "Kotlin",
  "Lisp",
  "Lua",
  "Matlab",
  "Natural Language",
  "NoSQL",
  "Objective-C",
  "Pascal",
  "Perl",
  "PHP",
  "PL/SQL",
  "Powershell",
  "Python",
  "R",
  "Racket",
  "Ruby",
  "Rust",
  "SAS",
  "Scala",
  "SQL",
  "Swift",
  "TSX",
  "TypeScript",
  "Visual Basic .NET",
  "Vue",
];

function createSystemMessage(
  inputLanguage: string,
  outputLanguage: string,
) {
  if (inputLanguage === "Natural Language") {
    return [
      "You are an expert programmer in all programming languages.",
      `Translate the natural language to "${outputLanguage}" code.`,
      "Provide back only the code, nothing before and nothing after.",
    ];
  }

  if (outputLanguage === "Natural Language") {
    return [
      "You are an expert programmer in all programming languages.",
      `Translate the "${inputLanguage}" code to natural language in plain English that the average adult could understand.`,
      "Respond as bullet points starting with -.",
    ];
  }

  return [
    "You are an expert programmer in all programming languages.",
    `Translate the "${inputLanguage}" code to "${outputLanguage}" code.`,
    "Provide back only the code, nothing before and nothing after.",
  ];
}

export default function IndexPage() {
  const [inputLanguage, setInputLanguage] = React.useState<string>("TypeScript");
  const [inputText, setInputText] = React.useState<string>("");
  const [outputLanguage, setOutputLanguage] = React.useState<string>("PHP");
  const [outputText, setOutputText] = React.useState<string>("");
  const [model, setModel] = React.useState<string>("gpt-3.5-turbo");
  const [loading, setLoading] = React.useState<boolean>(false);
  const [apiKey, setApiKey] = React.useState<string>("");

  const processSubmission = async () => {
    setLoading(true);
    setOutputText("");

    try {
      const openai = new OpenAIApi(new Configuration({ apiKey }));
      const response = await openai.createChatCompletion({
        model,
        messages: [
          { role: "system", content: createSystemMessage(inputLanguage, outputLanguage).join(" ") },
          { role: "user", content: inputText },
        ],
        temperature: 0,
        top_p: 1,
        n: 1,
      });

      if (
        !response.status
        || response.status < 200
        || response.status > 299
      ) {
        setLoading(false);

        let errorMessage = `OpenAI API Error: ${response.status} - ${response.statusText}`;

        if (response.data) {
          errorMessage += `\n\n${response.data}`;
        }

        if (response.status === 500) {
          errorMessage += "\n\nCheck the API status: https://status.openai.com";
        }

        setOutputText(errorMessage);

        return;
      }

      setOutputText(response.data.choices[0].message.content);
    } catch (error) {
      setOutputText(error.message);
    }

    setLoading(false);
  };

  React.useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");

    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  return (
    <Layout>
      <Head>
        <title>Next.js</title>
        <meta
          name="description"
          content="Next.js template for building apps with Radix UI and Tailwind CSS"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container grid items-center gap-6 pb-8 pt-6">
        <div className="flex w-full flex-col justify-between sm:flex-row sm:space-x-4">
          <div className="h-100 flex flex-col justify-center space-y-2 sm:w-2/4">
            <div className="text-sm font-bold">Input</div>

            <Select defaultValue={inputLanguage} onValueChange={(value) => setInputLanguage(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a programming language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Languages.map((language) => <SelectItem key={language} value={language}>{language}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Textarea
              value={inputText}
              onChange={(value) => setInputText(value.target.value)}
            />
          </div>
          <div className="mt-8 flex h-full flex-col justify-center space-y-2 sm:mt-0 sm:w-2/4">
            <div className="text-sm font-bold">Output</div>

            <Select defaultValue={outputLanguage} onValueChange={(value) => setOutputLanguage(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a programming language" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Languages.map((language) => <SelectItem key={language} value={language}>{language}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Textarea value={outputText} readOnly />
          </div>
        </div>

        <Separator />

        <div className="flex justify-between space-x-4">
          <div className="w-[256px]">
            <Select defaultValue={model} onValueChange={(value) => setModel(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an OpenAI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5</SelectItem>
                  <SelectItem value="gpt-4">GPT-4.0</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Input
            type="email"
            placeholder="OpenAI API Key"
            value={apiKey}
            onChange={(value) => {
              setApiKey(value.target.value);

              localStorage.setItem("apiKey", value.target.value);
            }}
          />

          <Button type="submit" onClick={() => processSubmission()} disabled={loading}>Process</Button>
        </div>
      </section>
    </Layout>
  );
}
