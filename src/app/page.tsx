'use client'

import { useState } from "react";
import Head from "next/head";
import { evaluate, derivative } from "mathjs";

// Define types for our iteration results
interface IterationResult {
  iteration: number;
  x: string;
  fx: string;
  fpx: string;
  fppx?: string;
  x_next: string;
  error: string;
  formula: string;
}

// Define types for example problems
interface ExampleProblem {
  title: string;
  equation: string;
  initialGuess: string;
  method: "standard" | "modified";
  description: string;
}

export default function Home() {
  const [equation, setEquation] = useState<string>(
    "12*x^3 - 30*x^2 - 84*x + 48"
  );
  const [initialGuess, setInitialGuess] = useState<string>("-1");
  const [iterations, setIterations] = useState<number>(3);
  const [method, setMethod] = useState<"standard" | "modified">("modified");
  const [results, setResults] = useState<IterationResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const calculateNewtonRaphson = (): void => {
    try {
      setLoading(true);
      setError("");

      // Parsing the function and initial guess
      const f = (x: number): number => evaluate(equation, { x });
      const fPrime = (x: number): number =>
        evaluate(derivative(equation, "x").toString(), { x });
      const fDoublePrime = (x: number): number =>
        evaluate(
          derivative(derivative(equation, "x").toString(), "x").toString(),
          { x }
        );

      let x0: number = parseFloat(initialGuess);
      const iterationResults: IterationResult[] = [];

      // Function to calculate relative error
      const calculateError = (current: number, previous: number): number =>
        Math.abs((current - previous) / current) * 100;

      for (let i = 0; i < iterations; i++) {
        const fx: number = parseFloat(f(x0).toFixed(2));
        const fpx: number = parseFloat(fPrime(x0).toFixed(2));
        const fppx: number = parseFloat(fDoublePrime(x0).toFixed(2));

        let x1: number;
        let et: number;

        if (method === "standard") {
          // Standard Newton-Raphson (use exact values for calculation, rounded for display)
          x1 = x0 - f(x0) / fPrime(x0);
          x1 = parseFloat(x1.toFixed(2)); // Round to 2 decimal places
          et = calculateError(x1, x0);

          iterationResults.push({
            iteration: i + 1,
            x: x0.toFixed(2),
            fx: fx.toFixed(2),
            fpx: fpx.toFixed(2),
            x_next: x1.toFixed(2),
            error: et.toFixed(2) + "%",
            formula: `x_{i+1} = x_i - \\frac{f(x_i)}{f'(x_i)}`,
          });
        } else {
          // Modified Newton-Raphson (use exact values for calculation, rounded for display)
          const numerator: number = f(x0) * fPrime(x0);
          const denominator: number =
            Math.pow(fPrime(x0), 2) - f(x0) * fDoublePrime(x0);
          x1 = x0 - numerator / denominator;
          x1 = parseFloat(x1.toFixed(2)); // Round to 2 decimal places
          et = calculateError(x1, x0);

          iterationResults.push({
            iteration: i + 1,
            x: x0.toFixed(2),
            fx: fx.toFixed(2),
            fpx: fpx.toFixed(2),
            fppx: fppx.toFixed(2),
            x_next: x1.toFixed(2),
            error: et.toFixed(2) + "%",
            formula: `x_{i+1} = x_i - \\frac{f(x_i) \\cdot f'(x_i)}{[f'(x_i)]^2 - f(x_i) \\cdot f''(x_i)}`,
          });
        }

        // Update for next iteration
        x0 = x1;
      }

      setResults(iterationResults);
    } catch (err) {
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Example problems
  const examples: ExampleProblem[] = [
    {
      title: "Example 1",
      equation: "12*x^3 - 30*x^2 - 84*x + 48",
      initialGuess: "-1",
      method: "modified",
      description: "Finding root of cubic equation",
    },
    {
      title: "Example 2",
      equation: "x^2 - 4",
      initialGuess: "3",
      method: "standard",
      description: "Finding square root of 4",
    },
    {
      title: "Example 3",
      equation: "exp(x) - 3*x",
      initialGuess: "1",
      method: "modified",
      description: "Exponential equation",
    },
  ];

  const loadExample = (example: ExampleProblem): void => {
    setEquation(example.equation);
    setInitialGuess(example.initialGuess);
    setMethod(example.method);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Head>
        <title>Newton-Raphson Method Calculator</title>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css"
        />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Newton-Raphson Method Calculator
        </h1>

        {/* Input Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Function f(x)
              </label>
              <input
                type="text"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-gray-400 focus:border-gray-400 text-white"
                placeholder="e.g. x^2 - 4"
              />
              <p className="mt-1 text-xs text-gray-400">
                Use standard math notation: x^2, sin(x), exp(x), etc.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Initial Guess (x₀)
              </label>
              <input
                type="text"
                value={initialGuess}
                onChange={(e) => setInitialGuess(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-gray-400 focus:border-gray-400 text-white"
                placeholder="e.g. 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Number of Iterations
              </label>
              <input
                type="number"
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value))}
                min="1"
                max="20"
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-gray-400 focus:border-gray-400 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Method
              </label>
              <select
                value={method}
                onChange={(e) =>
                  setMethod(e.target.value as "standard" | "modified")
                }
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded focus:ring-gray-400 focus:border-gray-400 text-white"
              >
                <option value="standard">Standard Newton-Raphson</option>
                <option value="modified">Modified Newton-Raphson</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={calculateNewtonRaphson}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                {loading ? "Calculating..." : "Calculate"}
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-700 text-gray-300 rounded border border-gray-600">
            <p className="font-medium">Note:</p>
            <p className="text-sm">
              All calculations are rounded to 2 decimal places for each step.
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-gray-700 text-red-300 rounded border border-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Example Problems Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">Example Problems</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {examples.map((example, index) => (
              <div
                key={index}
                className="border border-gray-700 p-4 rounded hover:bg-gray-700 cursor-pointer"
                onClick={() => loadExample(example)}
              >
                <h3 className="font-medium text-white">{example.title}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {example.description}
                </p>
                <p className="text-xs mt-2 text-gray-300">f(x) = {example.equation}</p>
                <p className="text-xs text-gray-300">x₀ = {example.initialGuess}</p>
                <p className="text-xs text-gray-300">
                  Method:{" "}
                  {example.method === "standard" ? "Standard" : "Modified"}
                </p>
              </div>
            ))}
          </div>
        </div>
        {/* Results Section */}
        {results.length > 0 && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-white">Iteration Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-700">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="border border-gray-600 p-2">Iteration</th>
                    <th className="border border-gray-600 p-2">x</th>
                    <th className="border border-gray-600 p-2">f(x)</th>
                    <th className="border border-gray-600 p-2">f&apos;(x)</th>
                    {method === "modified" && (
                      <th className="border border-gray-600 p-2">
                        f&apos;&apos;(x)
                      </th>
                    )}
                    <th className="border border-gray-600 p-2">x_next</th>
                    <th className="border border-gray-600 p-2">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.iteration} className="text-center">
                      <td className="border border-gray-600 p-2">
                        {result.iteration}
                      </td>
                      <td className="border border-gray-600 p-2">{result.x}</td>
                      <td className="border border-gray-600 p-2">{result.fx}</td>
                      <td className="border border-gray-600 p-2">{result.fpx}</td>
                      {method === "modified" && (
                        <td className="border border-gray-600 p-2">
                          {result.fppx}
                        </td>
                      )}
                      <td className="border border-gray-600 p-2">
                        {result.x_next}
                      </td>
                      <td className="border border-gray-600 p-2">
                        {result.error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}