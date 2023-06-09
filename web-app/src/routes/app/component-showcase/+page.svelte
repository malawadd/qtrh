<script lang="ts">
  import PlusIcon from 'design-system/icons/Plus.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import ThumbsUp from 'design-system/icons/ThumbsUp.svelte';
  import User from 'design-system/icons/User.svelte';
  import EyeOpen from 'design-system/icons/EyeOpen.svelte';

  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items as ListItems } from '$lib/components/list-select/list-select.types';
  import Button from '$lib/components/button/button.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Amount from '$lib/components/amount/amount.svelte';
  import ExampleTable from './examples/example-table.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { makeStep } from '$lib/components/stepper/types';
  import Step_1 from './examples/example-stepper-steps/step-1.svelte';
  import Step_2 from './examples/example-stepper-steps/step-2.svelte';
  import SuccessStep from './examples/example-stepper-steps/success-step.svelte';

  // Button
  let disabled = false;

  // List Select
  let selectedTokens: string[];
  let searchable = true;
  let multiselect = false;
  let exampleListItems: ListItems = {
   
    dai: {
      type: 'selectable',
      label: 'DAI',
      text: 'DAI',
      image: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png',
    },
    'test-action': {
      type: 'action',
      label: 'Add a custom token',
      image: {
        component: PlusIcon,
        props: {},
      },
      handler: () => undefined,
    },
  };

  // Amount
  let amount = '1000000000000000000';
  let tokenAddress = '0xa0f29623DDD59b9F82317b9bE0cD9bA7de58e449';
</script>

<h1>Component showcase</h1>

<div class="showcase-item">
  <h2>Button</h2>
  <div>
    <input id="button-disabled-checkbox" type="checkbox" bind:checked={disabled} />
    <label for="button-disabled-checkbox">Disabled</label>
  </div>
  <Button {disabled} icon={PlusIcon}>Example button</Button>
</div>

<div class="showcase-item">
  <h2>List Select</h2>
  <div>
    <input id="searchable-checkbox" type="checkbox" bind:checked={searchable} />
    <label for="searchable-checkbox">Searchable</label>
  </div>
  <div>
    <input id="multiselect-checkbox" type="checkbox" bind:checked={multiselect} />
    <label for="multiselect-checkbox">Multi-select</label>
  </div>
  <p>
    Selected tokens: {selectedTokens}
  </p>
  <div class="list-container">
    <ListSelect
      items={exampleListItems}
      bind:selected={selectedTokens}
      {searchable}
      {multiselect}
    />
  </div>
</div>

<div class="showcase-item">
  <h2>Section header</h2>
  <SectionHeader
    label="Hello"
    icon={ThumbsUp}
    actions={[
      {
        label: 'Trigger existential crisis',
        icon: User,
        handler: () => undefined,
      },
      {
        label: 'Witness',
        icon: EyeOpen,
        handler: () => undefined,
      },
    ]}
  />
</div>

<div class="showcase-item">
  <h2>Stepper</h2>
  <div class="stepper-wrapper">
    <Stepper
      steps={[
        makeStep({
          component: Step_1,
          props: {
            testProp: 'test prop value',
          },
        }),
        makeStep({
          component: Step_2,
          props: undefined,
        }),
        makeStep({
          component: SuccessStep,
          props: undefined,
        }),
      ]}
    />
  </div>
</div>

<div class="showcase-item">
  <h2>Amount</h2>
  <p>Amount</p>
  <TextInput bind:value={amount} />
  <p>Token Address</p>
  <TextInput bind:value={tokenAddress} />
  <p>Output:</p>
  <Amount
    amount={{
      amount: BigInt(amount),
      tokenAddress,
    }}
  />
</div>

<div class="showcase-item">
  <h2>Table</h2>
  <ExampleTable />
</div>

<style>
  h1 {
    color: var(--color-primary);
    margin-bottom: 2rem;
  }

  h2 {
    color: var(--color-primary);
    margin-bottom: 0.5rem;
  }

  .list-container {
    margin-top: 1rem;
    width: 32rem;
    height: 32rem;
    overflow: scroll;
    border: 1px solid var(--color-foreground);
    border-radius: 1rem 0 1rem 1rem;
    border-radius: 0.5rem;
  }

  .showcase-item {
    margin-bottom: 3rem;
  }

  .stepper-wrapper {
    border: 1px solid var(--color-foreground);
    border-radius: 0.5rem;
  }
</style>
