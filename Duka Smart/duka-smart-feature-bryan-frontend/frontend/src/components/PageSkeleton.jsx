import TopNav from "./TopNav";
import Footer from "./Footer";
import "./Skeleton.css";

const Bar = ({ w = "100%", h = 14, r = 8, className = "" }) => (
  <span className={"sk " + className} style={{ width: w, height: h, borderRadius: r }} />
);

// grey shimmering shapes that stand in for the page while its data loads
// kind: "dashboard", "list" (a table page) or "till" (the sales page)
function PageSkeleton({ active, kind = "list" }) {
  return (
    <div className="dash">
      <TopNav active={active} />

      <main className="dash-main" aria-busy="true" aria-label="Loading">
        <div className="sk-head">
          <Bar w="min(260px, 60%)" h={28} />
          <Bar w="min(340px, 80%)" h={14} />
        </div>

        <section className="kpis">
          {[0, 1, 2, 3].map((i) => (
            <div className={"kpi sk-kpi" + (i === 0 ? " first" : "")} key={i}>
              <Bar w="45%" h={12} />
              <Bar w="70%" h={26} />
              <Bar w="55%" h={11} />
            </div>
          ))}
        </section>

        {kind === "dashboard" && (
          <>
            <section className="split">
              <div className="panel"><Bar w="40%" h={18} /><Bar h={190} r={12} className="sk-gap" /></div>
              <div className="panel"><Bar w="45%" h={18} /><Bar h={190} r={12} className="sk-gap" /></div>
            </section>
            <section className="split">
              <div className="panel">
                <Bar w="35%" h={18} />
                {[0, 1, 2, 3].map((i) => <Bar key={i} h={44} r={10} className="sk-gap" />)}
              </div>
              <div className="panel">
                <Bar w="40%" h={18} />
                {[0, 1, 2, 3].map((i) => <Bar key={i} h={30} r={10} className="sk-gap" />)}
              </div>
            </section>
          </>
        )}

        {kind === "till" && (
          <section className="split sk-till">
            <div className="panel">
              <Bar h={44} r={10} />
              <div className="sk-tiles">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Bar key={i} h={96} r={12} />)}
              </div>
            </div>
            <div className="panel"><Bar w="45%" h={18} /><Bar h={180} r={12} className="sk-gap" /><Bar h={52} r={12} className="sk-gap" /></div>
          </section>
        )}

        {kind === "list" && (
          <div className="panel">
            <Bar h={44} r={10} />
            {[0, 1, 2, 3, 4, 5].map((i) => <Bar key={i} h={40} r={10} className="sk-gap" />)}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default PageSkeleton;
