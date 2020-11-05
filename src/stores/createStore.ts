/** @format */

import { fetchRepurchase, fetchStaff } from './../service/dart_api';
/** @format */

import { nanoid } from 'nanoid';
import {
  fetchCORPCODE,
  fetchAccountsOfFS,
  fetchMajorAccountsOfFS,
} from './../service/dart_api';
/** @format */

export function createStore() {
  return {
    corpList: [] as CORPCODE[],
    chosenCorpList: [] as ChosenCorpList[],
    focusedCorpList: {} as ChosenCorpList,
    async setCorpList() {
      try {
        const fetchedData = await fetchCORPCODE();
        console.log(fetchedData);
        this.corpList = [...fetchedData];
      } catch (err) {
        console.log(err);
      }
    },
    findCorpName(corp_name: string) {
      const pick = this.corpList.find(
        (li: CORPCODE) => li.corp_name === corp_name
      );
      return pick;
    },
    async addFetchedCorpData(choiceList: ChoiseCorpList) {
      try {
        let allAccounts;
        let majorAccounts;
        let repurchase;
        let staff;

        Promise.all([
          fetchAccountsOfFS(choiceList),
          fetchMajorAccountsOfFS(choiceList),
          fetchRepurchase(choiceList),
          fetchStaff(choiceList),
        ])
          .then((data) => {
            return data.map((li) =>
              li && li.data.status === '000' ? li.data.list : null
            );
          })
          .then((data) => {
            allAccounts =
              data[0] &&
              data[0].map((li: AccountsType) => ({
                ...li,
                id: nanoid(),
              }));
            majorAccounts = data[1];
            repurchase = data[2];
            staff = data[3];

            const fetchedData = {
              ...choiceList,
              allAccounts,
              majorAccounts,
              repurchase,
              staff,
            };
            this.chosenCorpList.push(fetchedData);
          });
      } catch (err) {
        console.log(err);
      }
    },
    setFocusedCorpList(data: ChosenCorpList) {
      this.focusedCorpList = data;
    },
    get fitteredMajorDataOfFocused() {
      const majorAccount = this.focusedCorpList?.majorAccounts;

      const ISdata = majorAccount?.filter(
        (li) => li.sj_div === 'IS' && li.fs_div === 'OFS'
      );
      const BSdata = majorAccount?.filter(
        (li) => li.sj_div === 'BS' && li.fs_div === 'OFS'
      );
      const CFdata = majorAccount?.filter(
        (li) => li.sj_div === 'CF' && li.fs_div === 'OFS'
      );
      return { ISdata, BSdata, CFdata };
    },
  };
}

export type TStore = ReturnType<typeof createStore>;