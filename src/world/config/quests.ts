import { ActionPlugin } from '@server/plugins/plugin';

export interface Quest {
    // The unique ID string for the quest.
    id: string;
    // The child ID of the quest's entry within the quest tab.
    questTabId: number;
    // The formatted name of the quest.
    name: string;
    // How many quest points are awarded upon completion of the quest.
    points: number;
    // The stages that the quest consists of. The given string should be the contents of the quest journal when opened for
    // that specific quest stage. A string or a function returning a string can be provided.
    stages: { [key: string]: Function | string | { color: number, text: string } };
    // Data for what to show on the "Quest Complete" widget.
    completion: {
        rewards: string[];
        onComplete: Function;
        modelId?: number;
        itemId?: number;
        modelRotationX?: number;
        modelRotationY?: number;
        modelZoom?: number;
    };
}

export interface QuestPlugin extends ActionPlugin {
    // The quest being registered.
    quest: Quest;
}

// @TODO quest requirements
export let quests: { [key: string]: Quest };

export function setQuestPlugins(questPlugins: ActionPlugin[]): void {
    quests = {};

    for(const plugin of questPlugins as QuestPlugin[]) {
        quests[plugin.quest.id] = plugin.quest;
    }
}
