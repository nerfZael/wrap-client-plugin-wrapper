import {
  Args_getFile,
  Args_getManifest,
  Args_getSchema,
  Args_invoke,
  Args_resolveToWrapper,
  Client,
  manifest,
  Module,
  WrapClient_InvocationResult,
} from "./wrap";

import { PluginFactory } from "@polywrap/core-js";

type NoConfig = Record<string, never>;

export class WrapClientPlugin extends Module<NoConfig> {

  async invoke(args: Args_invoke, client: Client): Promise<WrapClient_InvocationResult> {
    const result = await client.invoke<Uint8Array>({
      uri: args.uri,
      method: args.method,
      args: args.args ?? undefined,
      encodeResult: true
    });

    return {
      data: result.data,
      error: result.error 
        ? result.error.toString()
        : null
    };
  }

  async resolveToWrapper(args: Args_resolveToWrapper, client: Client): Promise<string | null> {
    const result = await client.resolveUri(args.uri);

    return JSON.stringify(result);
  }

  async getManifest(args: Args_getManifest, client: Client): Promise<string | null> {
    const result = await client.getManifest(
      args.uri,
      {}
    );

    return result
      ? JSON.stringify(result)
      : null;
  }

  async getSchema(args: Args_getSchema, client: Client): Promise<string | null> {
    const result = await client.getSchema(
      args.uri,
      {}
    );

    return result;
  }

  async getFile(args: Args_getFile, client: Client): Promise<Uint8Array | null> {
    const result = await client.getFile(
      args.uri,
      {
        path: args.filePath,
      }
    );

    return result as Uint8Array | null;
  }
}

export const wrapClientPlugin: PluginFactory<NoConfig> = () => {
  return {
    factory: () => new WrapClientPlugin({}),
    manifest,
  };
};

export const plugin = wrapClientPlugin;
