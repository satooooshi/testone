import React from 'react';
import {Icon, Dropdown, ScrollDiv, Modal, Button} from 'react-native-magnus';
import {BoardCategory, RuleCategory, UserRole, WikiType} from '../../../types';
import {defaultDropdownOptionProps} from '../../../utils/dropdown/helper';
import {isCreatableWiki} from '../../../utils/factory/wiki/isCreatableWiki';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';

export type SelectWikiArg = {
  type: WikiType;
  ruleCategory?: RuleCategory;
  boardCategory?: BoardCategory;
};
type ModalSelectingWikiTypeProps = {
  isVisible: boolean;
  onSelectWikiType: ({
    type,
    ruleCategory,
    boardCategory,
  }: SelectWikiArg) => void;
  userRole?: UserRole;
  onCloseModal: () => void;
};
const ModalSelectingWikiType: React.FC<ModalSelectingWikiTypeProps> = ({
  isVisible,
  onSelectWikiType,
  onCloseModal,
  userRole,
}) => {
  return (
    <Modal isVisible={isVisible}>
      <Button
        bg="gray400"
        h={35}
        w={35}
        right={15}
        alignSelf="flex-end"
        rounded="circle"
        onPress={() => {
          onCloseModal();
        }}>
        <Icon color="black" name="close" />
      </Button>
      <ScrollDiv>
        {isCreatableWiki({type: WikiType.RULES, userRole: userRole}) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.RULES,
                ruleCategory: RuleCategory.RULES,
              })
            }
            value={RuleCategory.RULES}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.RULES, true)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({type: WikiType.RULES, userRole: userRole}) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.RULES,
                ruleCategory: RuleCategory.PHILOSOPHY,
              })
            }
            value={RuleCategory.PHILOSOPHY}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.PHILOSOPHY, true)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({type: WikiType.RULES, userRole: userRole}) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.RULES,
                ruleCategory: RuleCategory.ABC,
              })
            }
            value={RuleCategory.ABC}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.ABC, true)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({type: WikiType.RULES, userRole: userRole}) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.RULES,
                ruleCategory: RuleCategory.BENEFITS,
              })
            }
            value={RuleCategory.BENEFITS}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.BENEFITS, true)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({type: WikiType.RULES, userRole: userRole}) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.RULES,
                ruleCategory: RuleCategory.DOCUMENT,
              })
            }
            value={RuleCategory.DOCUMENT}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.DOCUMENT, true)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({type: WikiType.ALL_POSTAL, userRole: userRole}) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.ALL_POSTAL,
                ruleCategory: RuleCategory.NON_RULE,
              })
            }
            value={WikiType.ALL_POSTAL}>
            {wikiTypeNameFactory(WikiType.ALL_POSTAL)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.MAIL_MAGAZINE,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.MAIL_MAGAZINE,
                ruleCategory: RuleCategory.NON_RULE,
              })
            }
            value={WikiType.MAIL_MAGAZINE}>
            {wikiTypeNameFactory(WikiType.MAIL_MAGAZINE)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.INTERVIEW,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.INTERVIEW,
                ruleCategory: RuleCategory.NON_RULE,
              })
            }
            value={WikiType.INTERVIEW}>
            {wikiTypeNameFactory(WikiType.INTERVIEW)}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.KNOWLEDGE,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.KNOWLEDGE,
              })
            }
            value={BoardCategory.KNOWLEDGE}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.KNOWLEDGE,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.QA,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.QA,
              })
            }
            value={BoardCategory.QA}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.QA,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.NEWS,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.NEWS,
              })
            }
            value={BoardCategory.NEWS}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.NEWS,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.IMPRESSIVE_UNIVERSITY,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.IMPRESSIVE_UNIVERSITY,
              })
            }
            value={BoardCategory.IMPRESSIVE_UNIVERSITY}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.IMPRESSIVE_UNIVERSITY,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.CLUB,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.CLUB,
              })
            }
            value={BoardCategory.CLUB}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.CLUB,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.STUDY_MEETING,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.STUDY_MEETING,
              })
            }
            value={BoardCategory.STUDY_MEETING}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.STUDY_MEETING,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.SELF_IMPROVEMENT,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.SELF_IMPROVEMENT,
              })
            }
            value={BoardCategory.SELF_IMPROVEMENT}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.SELF_IMPROVEMENT,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.PERSONAL_ANNOUNCEMENT,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.PERSONAL_ANNOUNCEMENT,
              })
            }
            value={BoardCategory.PERSONAL_ANNOUNCEMENT}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.PERSONAL_ANNOUNCEMENT,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.CELEBRATION,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.CELEBRATION,
              })
            }
            value={BoardCategory.CELEBRATION}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.CELEBRATION,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
        {isCreatableWiki({
          type: WikiType.BOARD,
          boardCategory: BoardCategory.OTHER,
          userRole: userRole,
        }) ? (
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              onSelectWikiType({
                type: WikiType.BOARD,
                ruleCategory: RuleCategory.NON_RULE,
                boardCategory: BoardCategory.OTHER,
              })
            }
            value={BoardCategory.OTHER}>
            {wikiTypeNameFactory(
              WikiType.BOARD,
              undefined,
              true,
              BoardCategory.OTHER,
            )}
          </Dropdown.Option>
        ) : (
          <></>
        )}
      </ScrollDiv>
    </Modal>
  );
};

export default ModalSelectingWikiType;
