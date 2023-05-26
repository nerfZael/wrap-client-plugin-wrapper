import { CoreClient, Invoker, Uri } from "@polywrap/core-js";
import {
  Args_getFile,
  Args_getManifest,
  Args_invoke,
  Args_resolveToWrapper,
  manifest,
  Module,
  WrapClient_InvocationResult,
} from "./wrap";
import { PluginFactory, PluginPackage } from "@polywrap/plugin-js";

type NoConfig = Record<string, never>;

export class WrapClientPlugin extends Module<NoConfig> {

  async invoke(args: Args_invoke, invoker: Invoker): Promise<WrapClient_InvocationResult> {
    const result = await invoker.invoke<Uint8Array>({
      uri: Uri.from(args.uri),
      method: args.method,
      args: args.args ?? undefined,
      encodeResult: true
    });

    return {
      data: result.ok 
        ? result.value
        : null,
      error: !result.ok 
        ? result.error
          ? result.error.toString()
          : "An unknown error occurred in the WrapClient"
        : null
    };
  }

  async resolveToWrapper(args: Args_resolveToWrapper, invoker: Invoker): Promise<string | null> {
    const client = invoker as unknown as CoreClient;
  
    const result = await client.tryResolveUri({ uri: Uri.from(args.uri) });

    return JSON.stringify(result);
  }

  async getManifest(args: Args_getManifest, invoker: Invoker): Promise<string | null> {
    const client = invoker as unknown as CoreClient;
   
    const result = await client.getManifest(Uri.from(args.uri));

    return result
      ? JSON.stringify(result)
      : null;
  }

  async getFile(args: Args_getFile, invoker: Invoker): Promise<Uint8Array | null> {
    const client = invoker as unknown as CoreClient;
  
    const result = await client.getFile(
      Uri.from(args.uri),
      {
        path: args.filePath,
      }
    );

    return result.ok
      ? result.value as Uint8Array
      : null;
  }
}

export const wrapClientPlugin: PluginFactory<NoConfig> = () => new PluginPackage<NoConfig>(
  new WrapClientPlugin({}),
  manifest
);

export const plugin = wrapClientPlugin;
