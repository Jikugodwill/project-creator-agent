import getSocialDataFormat from "./getSocialDataFormat";
import { getMainnetRpcProvider, view } from "@near-js/client";
import {
  Transaction,
  buildTransaction,
  calculateDepositByDataSize,
  validateNearAddress,
} from "@wpdas/naxios";
import { parseNearAmount } from "@near-js/utils";
import * as socialDb from "@/common/social";
import deepObjectDiff from "@/common/lib/deepObjectDiff";
import { useProjectContext } from "@/context/ProjectConext";
import { LISTS_CONTRACT_ID } from "@/common/constants";
import { naxiosInstance } from "./naxiosInstance";

// Define the SocialTransactionType interface
interface SocialTransactionType {
  // Add properties according to your requirements
  receiverId: string;
  args: any; // Replace 'any' with the actual type if known
  deposit: string; // Assuming deposit is a string, adjust if necessary
}

const getSocialData = async (accountId: string) => {
  try {
    const socialData = await socialDb.getSocialProfile({ accountId });
    return socialData;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const CreateOrUpdateProjectHandler = async (accountId: string) => {
  const { state, dispatch } = useProjectContext();
  const data = state.projectEditor;

  const potlockRegistryArgs = {
    args: {
      list_id: 1, // hardcoding to potlock registry list for now
    },
  };
  // If there is an existing social data, make the diff between then
  const existingSocialData = await getSocialData(accountId);
  // Social Data Format
  const socialData = getSocialDataFormat(data);

  const diff = existingSocialData
    ? deepObjectDiff(existingSocialData, socialData)
    : socialData;

  const socialArgs = {
    data: {
      [accountId]: diff,
    },
  };

  let depositFloat = calculateDepositByDataSize(socialArgs);

  // First, we have to check the account from social.near to see if it exists. If it doesn't, we need to add 0.1N to the deposit
  try {
    const account = await socialDb.getAccount({ accountId });
    if (!account) {
      depositFloat = (Number(depositFloat) + 0.1).toString();
    }
    // social.near
    const socialTransactionArgs = await view<SocialTransactionType[]>({
      account: "social.near",
      method: "set",
      args: {
        receiverId: "social.near",
        args: socialArgs,
        deposit: parseNearAmount(depositFloat)!,
      },
      deps: { rpcProvider: getMainnetRpcProvider() },
    });

    const socialTransaction = buildTransaction("set", {
      receiverId: "social.near",
      args: socialArgs,
      deposit: parseNearAmount(depositFloat)!,
    });

    const transactions: Transaction<any>[] = [socialTransaction];
    let daoTransactions: Transaction<any>[] = [];

    // if this is a creation action, we need to add the registry
    if (!data.isEdit) {
      transactions.push(
        buildTransaction("register_batch", {
          receiverId: LISTS_CONTRACT_ID,
          args: potlockRegistryArgs,
          deposit: parseNearAmount("0.05")!,
        })
      );
    }
    // Final registration step
    const callbackUrl = `${location.origin}${location.pathname}?done=true`;
    await naxiosInstance.contractApi().callMultiple(transactions, callbackUrl);
  } catch (error) {
    return {
      success: false,
      error: "Error during the project registration.",
    };
  }

  dispatch({ type: "RESET" });
};
