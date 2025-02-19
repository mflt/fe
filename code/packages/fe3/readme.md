Frankie viewmodel core (FeVM), instead of Frankie you can say Ferrum (chemical Fe)

The main concept behind FeVM is to provide viewmodel UI collections strongly associated with data collections
from the underlying (business) model.
In other words a UI driven by data (just another attempt to implement this classic UI task).
Controlling data source is assumed as a collection of data of same type (records or docs), we call it values.
Supported values (values in plural meaning the collection) are Arrays, Maps, WeakMaps and keyed (also iterable) objects.
Supported value (the element of the collection) can be anything.
This library assumes values collections as external entities and never mutes those
-- well except a few top level optional convenience methods thru which it is handy to eg. add now values to the collection.
It is also assumed that UI updates are triggered by changes in the underlying value collections ('values', plural).
The FeVM library implement "parasite" collections shades and shapes where a shade or a shape extends a value
with props which are not part of the data model but are related to the view-model level, or call it UI.
Each value then has its corresponding shape or shade. The association of values and shades (shapes) we call the strand,
please recall DNS for the logic of this naming.
A shade carries props which are not part of the corresponding value and help UI processing (eg. the hash of a value),
when a shade starts to operate specific UI related concepts (like an HTML element eg.) we designate that as shape.
Strand knows shapes, as strands are assume to incorporate UI related templates and actions.
(so shapes is an intermediary concept and belongs more to the internal details of FEVM conceptual structuring.)
Strands support reactivity by implementing beats which is a home-made signal (see reactive beat),
and shades by default carry its own beat field which is mostly not functional.
It is assumed that the user program implements the strand class merged with a reactive store class (like Exome),
however internally FeVM, or our UI framework based on it, the Frankie/Frankenstein do not use external store mechanisms,
as developers using it are assumed to be opinionated about the stores of their choice. We provide a helper to merge
a strand with your store class by utilizing a pattern suggested by the Typescript documentation.
Note: collections are always referred to by plural words. Like we say SlicesScroller not SliceScroller.
Also our specific speak in camel-case naming is to start prepositions (in, with) by lower case, bear with it please :)
Though its exceptions are easily made when saying InMap or OnValueReset helps readability, as we see it.
Also we use term entry (ery) when referring to an item or an element when it's not specifically a value or a shape.
Term payload we use when referring to an object whose type is not important, like the portion of the value used to produce a unique hash.
