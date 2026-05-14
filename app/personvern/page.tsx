export default function PersonvernPage() {
  return (
    <main style={{ padding: "16px", maxWidth: "720px" }}>
      <h1>Personvern</h1>

      <p>
        Turmerker er en frivillig aktivitetskonkurranse for bedriftsidrettslaget.
      </p>

      <h2>Hva lagres?</h2>
      <p>
        Vi lagrer e-postadresse og innsjekkinger på turmål. En innsjekking består
        av bruker, turmål og tidspunkt.
      </p>

      <h2>Hva lagres ikke?</h2>
      <p>
        Vi lagrer ikke kontinuerlig GPS-sporing, ruter eller bevegelseshistorikk.
        GPS brukes bare i nettleseren for å kontrollere om du er nær nok et turmål
        når du trykker på “Sjekk inn”.
      </p>

      <h2>Hva brukes dataene til?</h2>
      <p>
        Dataene brukes til å vise dine besøkte steder, poeng og topplister i
        aktivitetskonkurransen.
      </p>

      <h2>Synlighet</h2>
      <p>
        Navn/e-post og poeng kan vises på toppliste for andre deltakere.
      </p>

      <h2>Sletting</h2>
      <p>
        Du kan be administrator om å få slettet dine innsjekkinger og brukerdata.
      </p>

      <h2>Kontakt</h2>
      <p>
        Kontakt bedriftsidrettslaget dersom du har spørsmål om personvern eller
        ønsker sletting av data.
      </p>

      <a href="/">Tilbake til kartet</a>
    </main>
  );
}