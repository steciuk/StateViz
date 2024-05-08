type NestedProp = {
  name: string;
  children: NestedProp[];
  obj?: {
    [key: string]: string;
  };
};

const nestedProp: NestedProp = {
  name: "root",
  children: [
    {
      name: "child1",
      obj: {
        key1: "value1",
        key2: "value2",
      },
      children: [
        {
          name: "child1.1",
          children: [],
        },
        {
          name: "child1.2",
          children: [],
        },
      ],
    },
    {
      name: "child2",
      children: [
        {
          name: "child2.1",
          children: [],
        },
        {
          name: "child2.2",
          children: [],
        },
        {
          name: "child2.3",
          children: [],
        },
      ],
    },
  ],
};

export const ComplexProp = () => {
  return (
    <>
      <h2>ComplexPropParent</h2>
      <ComplexPropChild phone="+48 123 456 789" nestedProp={nestedProp} />
    </>
  );
};

const ComplexPropChild = (props: { phone: string; nestedProp: NestedProp }) => {
  props;
  return <div>ComplexPropChild</div>;
};
